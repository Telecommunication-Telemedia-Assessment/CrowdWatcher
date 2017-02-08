#include "Predictor.h"
#include "Ransac.h"
#include <boost/lambda/lambda.hpp>
#include <boost/shared_ptr.hpp>
#include "Options.h"
#include "Logger.h"

Predictor::Predictor(const XMLReader *xmlReader, const CSVReader<float>* csvReader) {
	this->xmlReader = xmlReader;
	this->csvReader = csvReader;
}


void Predictor::fit() {
	fit(XMLReader::Click::X, EyeTrackerCSV::EX_0); // left eye
	fit(XMLReader::Click::X, EyeTrackerCSV::EX_0, EyeTrackerCSV::FX_28); // normalize left eye position by nose's position
	fit(XMLReader::Click::X, EyeTrackerCSV::EX_0, EyeTrackerCSV::FX_36); // normalize left eye position by left eye's corner position
	fit(XMLReader::Click::X, EyeTrackerCSV::EX_1); // right eye
	fit(XMLReader::Click::X, EyeTrackerCSV::EX_1, EyeTrackerCSV::FX_28); // normalize right eye position by nose's position
	fit(XMLReader::Click::X, EyeTrackerCSV::EX_0, EyeTrackerCSV::FX_45); // normalize left eye position by right eye's corner position


	fit(XMLReader::Click::Y, EyeTrackerCSV::EY_0);
	fit(XMLReader::Click::Y, EyeTrackerCSV::EY_0, EyeTrackerCSV::FY_28); // normalize left eye position by nose's position
	fit(XMLReader::Click::Y, EyeTrackerCSV::FY_40, EyeTrackerCSV::FY_38); // the visible height of the eye can actually be a measure of the eye position on the vertical direction (because of the camera position) this performs such a measure for the left eye
	fit(XMLReader::Click::Y, EyeTrackerCSV::EY_1);
	fit(XMLReader::Click::Y, EyeTrackerCSV::EY_1, EyeTrackerCSV::FY_28); // normalize right eye position by nose's position
	fit(XMLReader::Click::Y, EyeTrackerCSV::FY_44, EyeTrackerCSV::FY_46); // the visible height of the eye can actually be a measure of the eye position on the vertical direction (because of the camera position) this perform such measure for the right eye

	// compute the averages solutions (prediction from the two eyes)
	//solutionManager.compile();
}

template<typename T>
void printArr(std::vector<T> arr, std::string name = "") {
    std::cout << name << " [";
    for (size_t i = 0; i < arr.size(); i++) {
        std::cout << arr[i];

        if (i != arr.size() - 1)
            std::cout << ", ";
    }
    std::cout << "]" << std::endl;
}

void Predictor::fit(XMLReader::Click::Axis click_axis,
					EyeTrackerCSV::Value eye_axis,
					EyeTrackerCSV::Value ref_point,
					int sliding_window_first_frame,
					int sliding_window_last_frame) {

	using namespace boost::lambda;

	std::vector< float > marker_frames = getMarkerFrames();
	const std::vector< int > &clicks_frames = xmlReader->get(XMLReader::Click::FRAME);
	const std::vector< int > &clicks_types = xmlReader->get(XMLReader::Click::TYPE);

	std::vector<float> align = alignTimeSeries(marker_frames, clicks_frames, clicks_types);

	// if it was not possible to fit a solution to this equation, then quit.
	if (align.size() == 0)
		return;

	// find the indexes of the frames in the video which match to the click events
	std::vector<int> index_frames;
	for (size_t i = 0; i < clicks_frames.size(); ++i) {
		index_frames.push_back(align[1] * clicks_frames[i] + align[0]);
	}

	// get the matching positions eye & click !
	std::vector<float> eye_positions = csvReader->lookup(index_frames, EyeTrackerCSV::FRAME, eye_axis);

	// if a reference point is provided, then change the referential of the eye position
	if (ref_point != EyeTrackerCSV::NONE) {
		std::vector<float> ref_point_values = csvReader->lookup(index_frames, EyeTrackerCSV::FRAME, ref_point);
		for (size_t i = 0; i < eye_positions.size(); ++i) {
			eye_positions[i] -=  ref_point_values[i];
		}
	}

	// get the matching click positions
	std::vector<int> click_positions = xmlReader->get(click_axis);


	// due to the regression between the timestamps, there are non-valid values (generally one negative position: before the camera turned on
	// and other clicks after the camera was off, so we need to remove them).
	// A second reason to remove calibration data points is when they do not belong to the considered sliding window
	for (size_t i = 0; i < index_frames.size(); ++i) {
		if (index_frames[i] < 0
			|| index_frames[i] > (*csvReader)[EyeTrackerCSV::FRAME].back()-1
			|| click_positions[i] == -1
			|| index_frames[i] < sliding_window_first_frame
			|| index_frames[i] > sliding_window_last_frame ) {

			index_frames.erase(index_frames.begin() + i);
			eye_positions.erase(eye_positions.begin() + i);
			click_positions.erase(click_positions.begin() + i);

			i = -1;
		}
	}

	if(Options::DISPLAY_ALIGNED_FEATURES) {
		Logger::get()->log(eye_positions, click_positions, click_axis, eye_axis, ref_point);
	}

	// RANSAC fit
	std::vector<float> coeffs = ransacFit(eye_positions, click_positions);

	// if it was not possible to fit a solution to this equation, then quit.
	if (coeffs.size() == 0)
		return;

	// measure the prediction accuracy
	std::vector<float> known_positions_predictions = polyval(coeffs, eye_positions);
	std::vector<float> prediction_errors(known_positions_predictions.size());
	for (size_t i = 0; i < known_positions_predictions.size(); ++i) {
		prediction_errors[i] = known_positions_predictions[i] - click_positions[i];
	}

	// save the solution
	if (ref_point != EyeTrackerCSV::NONE) {
		std::vector<float> normalized_eye_positions = csvReader->getColumn(eye_axis);
		const std::vector<float> &ref_point_values = csvReader->getColumn(ref_point);
		for (size_t i = 0; i < normalized_eye_positions.size(); ++i)
			normalized_eye_positions[i] -=	ref_point_values[i];

		solutionManager.addSolution(
			polyval(coeffs, normalized_eye_positions),
			prediction_errors,
			index_frames,
			static_cast<Solution<float>::Axis>(click_axis)
		);

	} else {
		solutionManager.addSolution(
			polyval(coeffs, csvReader->getColumn(eye_axis)),
			prediction_errors,
			index_frames,
			static_cast<Solution<float>::Axis>(click_axis)
		);
	}
}


Solution<float> Predictor::getPredictions(Solution<float>::Axis axis) {
	return solutionManager.getSolution(axis);
}


std::vector<int> Predictor::align(const std::vector<int> &xmlFrameNumbers) const {

	using namespace boost::lambda;

    std::vector< float > marker_frames = getMarkerFrames();
	const std::vector< int > &clicks_frames = xmlReader->get(XMLReader::Click::FRAME);

	std::vector<int> clicks_types(std::min<size_t>(marker_frames.size(), clicks_frames.size()), 0);

	std::vector<float> align = alignTimeSeries(marker_frames, clicks_frames, clicks_types);

	// if it was not possible to fit a solution to this equation, then quit.
	if (align.size() == 0) return std::vector<int>();


	// find the indexes of the frames in the video which match to the click events
	std::vector<int>   index_frames;
	for (size_t i = 0; i < xmlFrameNumbers.size(); ++i) {
		index_frames.push_back(align[1]*xmlFrameNumbers[i]+align[0]);
	}

	return index_frames;
}

// determine marked click frames in the video from increasing numbers
std::vector<float> Predictor::getMarkerFrames() const {
	const std::vector<float> &frames = csvReader->getColumn(EyeTrackerCSV::FRAME);
	const std::vector<float> &clicks = csvReader->getColumn(EyeTrackerCSV::CLICK);
	std::vector<float> marker_frames;
	float lastClick = 0;
	float matchCount = 0;

	for (size_t i = 0; i < frames.size(); i++) {
		float click = clicks[i];

		if (click > lastClick) {
			matchCount++;

		} else {
			// match atleast 2 in a row
			if (matchCount > 1)
				marker_frames.push_back(frames[i] - lastClick);

			matchCount = 0;

			if (click > 0)
				matchCount++;
		}
		lastClick = click;
	}
	return marker_frames;
}


// find the offset between the time series from the click logs and the markers on the video
std::vector<float> Predictor::alignTimeSeries(std::vector< float > &marker_frames, const std::vector< int > &clicks_frames, const std::vector< int > &clicks_types) const {

	size_t nb_data_points = std::min<size_t>(marker_frames.size(), clicks_frames.size());
	std::vector<float> x, y;
	int counter = 0;
	for (size_t i = 0; i < nb_data_points; ++i) {
		// only use real clicks for alignment
		if (clicks_types[i] == 0) {
			x.push_back(clicks_frames[clicks_frames.size() - nb_data_points + i]);
			y.push_back(marker_frames[counter++]);
		}
	}

	if(Options::DISPLAY_TEMPORAL_ALIGNMENT) {
		Logger::get()->log(x, y);
	}

	return polyfit<float>(x,y,1);
}


std::vector<float> Predictor::ransacFit(const std::vector< float > &eye_positions, const std::vector< int > &click_positions) const {
	std::vector< std::vector<float> > dataset;
	std::vector< std::vector<float> > result;

	// initialize dataset
	for (size_t i = 0; i < eye_positions.size(); i++) {
		std::vector<float> point;
		point.push_back(eye_positions[i]);
		point.push_back(click_positions[i]);
		dataset.push_back(point);
	}

	// initialize LineModel
	boost::shared_ptr<LineModel> model(new LineModel());
	model->setDistanceTreshold(Options::RANSAC_THRESHOLD);

	// do the ransac fit
	boost::shared_ptr<Ransac> ransac(new Ransac(model));
	ransac->fit(dataset);
	ransac->getInliers(&result);

	if (result.size() == 0)
		throw std::invalid_argument("Could not estimate a planar model for the given dataset.");

	std::vector<float> x(result.size()), y(result.size());
	for (size_t i = 0; i < result.size(); i++) {
		x[i] = result[i][0];
		y[i] = result[i][1];
	}

	return polyfit(x,y,1);
}
