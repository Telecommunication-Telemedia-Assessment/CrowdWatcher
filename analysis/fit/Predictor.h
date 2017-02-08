#ifndef _Predictor_
#define _Predictor_

#include "XMLReader.h"
#include "CSVReader.h"
#include "SolutionManager.h"

#include <limits>

struct EyeTrackerCSV {
	enum Value {
		FRAME = 0, TIMESTAMP, CONFIDENCE, SUCCESS, CLICK, FX_0, FY_0, FX_1, FY_1, FX_2, FY_2, FX_3, FY_3, FX_4, FY_4, FX_5, FY_5, FX_6, FY_6, FX_7, FY_7, FX_8, FY_8, FX_9, FY_9, FX_10, FY_10, FX_11, FY_11, FX_12, FY_12, FX_13, FY_13, FX_14, FY_14, FX_15, FY_15, FX_16, FY_16, FX_17, FY_17, FX_18, FY_18, FX_19, FY_19, FX_20, FY_20, FX_21, FY_21, FX_22, FY_22, FX_23, FY_23, FX_24, FY_24, FX_25, FY_25, FX_26, FY_26, FX_27, FY_27, FX_28, FY_28, FX_29, FY_29, FX_30, FY_30, FX_31, FY_31, FX_32, FY_32, FX_33, FY_33, FX_34, FY_34, FX_35, FY_35, FX_36, FY_36, FX_37, FY_37, FX_38, FY_38, FX_39, FY_39, FX_40, FY_40, FX_41, FY_41, FX_42, FY_42, FX_43, FY_43, FX_44, FY_44, FX_45, FY_45, FX_46, FY_46, FX_47, FY_47, FX_48, FY_48, FX_49, FY_49, FX_50, FY_50, FX_51, FY_51, FX_52, FY_52, FX_53, FY_53, FX_54, FY_54, FX_55, FY_55, FX_56, FY_56, FX_57, FY_57, FX_58, FY_58, FX_59, FY_59, FX_60, FY_60, FX_61, FY_61, FX_62, FY_62, FX_63, FY_63, FX_64, FY_64, FX_65, FY_65, FX_66, FY_66, FX_67, FY_67, EX_0, EY_0, EX_1, EY_1, NONE
	};
};

class Predictor {

private:
	const XMLReader 		*xmlReader;
	const CSVReader<float>	*csvReader;
	SolutionManager			 solutionManager;


public:

	Predictor(const XMLReader *xmlReader, const CSVReader<float>* csvReader);

	void 		fit		();
	void 		fit		(XMLReader::Click::Axis click_axis,
						 EyeTrackerCSV::Value eye_axis,
						 EyeTrackerCSV::Value ref_point = EyeTrackerCSV::NONE,
						 int sliding_window_first_frame = 0,
						 int sliding_window_last_frame = std::numeric_limits<int>::max() );


	Solution<float> 	getPredictions(Solution<float>::Axis axis);
	std::vector<int>    align(const std::vector<int> &xmlFrameNumbers) const;

private:
    std::vector<float> getMarkerFrames() const;
	std::vector<float> alignTimeSeries(std::vector< float > &marker_frames, const std::vector< int > &clicks_frames, const std::vector< int > &clicks_types) const;

	template<typename T>
	std::vector<T> polyfit( const std::vector<T>& oX, const std::vector<T>& oY, int nDegree ) const;

	template<typename T>
	std::vector<T> polyval( const std::vector<T>& oCoeff,  const std::vector<T>& oX ) const;

	std::vector< float > ransacFit(const std::vector< float > &eye_positions, const std::vector< int   > &click_positions) const;


};


#include "Predictor.hpp"

#endif
