#include <opencv2/highgui/highgui.hpp>
#include <opencv2/imgproc/imgproc.hpp>

#include <iostream>
#include <fstream>
#include <limits>

#include <boost/program_options.hpp>
#include <boost/lexical_cast.hpp>

#include "CSVReader.h"
#include "XMLReader.h"
#include "Predictor.h"
#include "Options.h"
#include "Logger.h"

void display_calibration_results(const Solution<float> &solX, const Solution<float> &solY, std::ostream &os, const XMLReader &xml) {
	const std::vector< int > &click_types = xml.get(XMLReader::Click::TYPE);
	os << "frame, x, CI_x, y, CI_y, distraction\n";
	for(size_t i = 0 ; i < solX.errors.size() ; ++i) {
		os << solX.errors_frames[i] << ", " << solX.predictions[solX.errors_frames[i]] << ", " << solX.errors[i] << ", " << solY.predictions[solY.errors_frames[i]] << ", " << solY.errors[i] << ", " << click_types[i] << std::endl;
	}
}

template<typename T>
int lfind(T value, const std::vector<T> &vect) {

	for (size_t i = 0; i < vect.size(); ++i) {
		if(value == vect[i])
			return i;
	}

	return std::numeric_limits<int>::max();
}

void display_results(const Solution<float> &solX, const Solution<float> &solY, std::ostream &os, const XMLReader &xml, const Predictor& predictor) {
	const std::vector< int > &click_types = xml.get(XMLReader::Click::TYPE);
	std::vector< int > event_frames = predictor.align(xml.getEventFrames());

	os << "frame, x, CI_x, y, CI_y, distraction, notes\n";

	for (size_t i = 0 ; i < solX.predictions.size() ; ++i) {
		os << i << ", " << solX.predictions[i] << ", ";

		int index = lfind((int) i, solX.errors_frames);
		if(index != std::numeric_limits<int>::max()) {
			os << solX.errors[index];
		}

		os << ", " << solY.predictions[i] << ", ";

		index = lfind((int) i, solY.errors_frames);
		if(index != std::numeric_limits<int>::max()) {
			os << solY.errors[index];
		}

		os << ", ";

		index = lfind((int) i, solY.errors_frames);
		if(index != std::numeric_limits<int>::max()) {
			os << click_types[index];
		}

		os << ", ";

		index = lfind((int) i, event_frames);
		if(index != std::numeric_limits<int>::max()) {
			os << xml.getEvent()[index];
		}

		os << "\n";

	}
}


int main(int argc, char **argv) {

	// ------------------------------------------------------------------------------------------------------------------------------------------
	// parse parameters

	namespace po = boost::program_options;

	po::positional_options_description p;
	p.add("input-file", -1);

	po::options_description desc("Allowed options");
	desc.add_options()
			("help", "produce help message")
			("facial-features,f", po::value< std::string >(), "CSV file from the Cambridge CLM-framework (obtained using the option: -ofeatures_2d). See: https://github.com/TadasBaltrusaitis/CLM-framework and provided path.")
			("calibration-file,c", po::value< std::string >(), "XML file from the Rails Web application providing information on user clicks (the file should be located in the /upload folder). ")
			("input-video,v", po::value< std::string >(), "[Optional] display the extracted facial feature points on the captured video.")
			("output,o", po::value< std::string >(), "[Optional] Output the predicted fixations into a file. Default: standard output.")
			("ransac-threshold", po::value<float>(), "[Optional] Set the threshold for the RANSAC fitting. Default: 3.0")
			("display-calibration-points", "[Information] Provide fixations predictions for only data points having predictions accuracy values")
			("display-aligned-features", "[Information] Provide the RAW features aligned with the click positions")
			("display-temporal-alignment", "[Information] Provide the RAW frame number of the video file and click timestamps")
			("verbose", "Provide details on calibration steps")
	;

	po::variables_map vm;
	try {
		po::store(po::command_line_parser(argc, argv).options(desc).positional(p).run(), vm);
		po::notify(vm);
	} catch(boost::exception &) {
		std::cerr << "Error incorect program options. See --help... \n";
		return 0;
	}

	if (vm.count("help")) {
		std::cout << "--------------------------------------------------------------------------------\n";
		std::cout << "\t\tEye tracking tool\n";
		std::cout << "--------------------------------------------------------------------------------\n";
		std::cout << "Audio Visual Technology - Institute of Media Technology, TU-Ilmenau\n";
		std::cout << "Helmholtzplatz 2, 98693 Ilmenau, Germany\n";
		std::cout << "( http://www.tu-ilmenau.de/en/audio-visual-technology/ )\n\n";
		std::cout << "Contact for this program: \n";
		std::cout << "\t Pierre Lebreton 0049 3677 691577\n";
		std::cout << "\t Pierre.Lebreton@tu-ilmenau.de \n\n";
		std::cout << "--------------------------------------------------------------------------------\n";
		std::cout << "\n\n";
		std::cout << desc << "\n";
		return 1;
	}

	std::string csvFile;
	std::string xmlFile;
	std::string videoFile;
	std::string outputFile;
	bool only_calibration_points = false;
	bool result = false;

	if (vm.count("facial-features")) {
		csvFile = vm["facial-features"].as< std::string >();
	} else {
		std::cerr << "It is required to provide the facial feature file. See --help\n";
		return 0;
	}

	if (vm.count("calibration-file")) {
		xmlFile = vm["calibration-file"].as< std::string >();
	} else {
		std::cerr << "It is required to provide the calibration file. See --help\n";
		return 0;
	}

	if (vm.count("input-video")) {
		videoFile = vm["input-video"].as< std::string >();
	}

	if (vm.count("output")) {
		outputFile = vm["output"].as< std::string >();
	}


	if (vm.count("ransac-threshold")) {
		Options::RANSAC_THRESHOLD = vm["ransac-threshold"].as< float >();
	}

	if (vm.count("verbose")) {
		Options::VERBOSE = true;
	}

	if(vm.count("display-calibration-points")) {
		only_calibration_points = true;
	}

	if(vm.count("display-aligned-features")) {
		Options::DISPLAY_ALIGNED_FEATURES = true;
	}

	if(vm.count("display-temporal-alignment")) {
		Options::DISPLAY_TEMPORAL_ALIGNMENT = true;
	}


	// ------------------------------------------------------------------------------------------------------------------------------------------
	// program start

	CSVReader<float> reader;
	result = reader.open(csvFile, ",\n", true);

	if(!result){
		std::cerr << "[Warning] Cannot open file: " << csvFile << " \n Exiting. \n";
		return -1;
	}

	XMLReader xml;
	result = xml.open(xmlFile);

	if(!result){
		std::cerr << "[Warning] Cannot not read: " << xmlFile << " \n Exiting. \n";
		return -1;
	}

	Predictor predictor(&xml, &reader);
	predictor.fit();

	Solution<float> solX = predictor.getPredictions(Solution<float>::X);
	Solution<float> solY = predictor.getPredictions(Solution<float>::Y);

	if(!outputFile.empty()) {
		std::ofstream ofs(outputFile.c_str());
		if(!ofs.is_open()) {
			std::cerr << "Cannot open file: " << outputFile << std::endl;
		}

		if(only_calibration_points) {
			display_calibration_results(solX, solY, ofs, xml);
		} else {
			display_results(solX, solY, ofs, xml, predictor);
		}

	} else {

		if(only_calibration_points) {
			display_calibration_results(solX, solY, std::cout, xml);
		} else {
			display_results(solX, solY, std::cout, xml, predictor);
		}
	}

	if(Options::DISPLAY_ALIGNED_FEATURES) {
		Logger::get()->show_features();
	}

	if(Options::DISPLAY_TEMPORAL_ALIGNMENT) {
		Logger::get()->show_temporal_alignment();
	}

	// ------------------------------------------------------------------------------------------------------------------------------------------
	// display feature extraction


	if(videoFile.empty())
		return 0;

	cv::VideoCapture capture;
	capture.open(videoFile);

	if(!capture.isOpened()) {
		std::cerr << "[Warning] Cannot open file: " << argv[2] << " \n Exiting. \n";
		return -1;
	}


	cv::Mat frame;
	capture >> frame ;


	int c = 0;
	int frame_number = 0;
	int feature = 5;
	while(!frame.empty()) {

		for(int i = 5 ; i < 145 ; i += 2) {
			cv::circle(frame, cv::Point(reader[i][frame_number], reader[i+1][frame_number]), 3, 1234);
		}

		cv::circle(frame, cv::Point(reader[feature][frame_number], reader[feature+1][frame_number]), 4, 1234);


		cv::imshow("frame", frame);

		++frame_number;
		capture >> frame ;

		c = cv::waitKey(10);

		if( (char)c == 'c' ) { break; }
		if( (char)c == 'n' ) { feature += 2; std::cout << "FX_" << (feature-5)/2 << "\n"; }
		if( (char)c == 'p' ) { feature -= 2; std::cout << "FX_" << (feature-5)/2 << "\n"; }

	}

	return 0;
}
