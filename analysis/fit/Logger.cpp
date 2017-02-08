#include "Logger.h"
#include <iostream>

Logger *Logger::m_This = NULL;



Logger::Logger() {

	m_EyeAxisToString.push_back("FRAME");
	m_EyeAxisToString.push_back("TIMESTAMP");
	m_EyeAxisToString.push_back("CONFIDENCE");
	m_EyeAxisToString.push_back("SUCCESS");
	m_EyeAxisToString.push_back("CLICK");
	m_EyeAxisToString.push_back("FX_0");
	m_EyeAxisToString.push_back("FY_0");
	m_EyeAxisToString.push_back("FX_1");
	m_EyeAxisToString.push_back("FY_1");
	m_EyeAxisToString.push_back("FX_2");
	m_EyeAxisToString.push_back("FY_2");
	m_EyeAxisToString.push_back("FX_3");
	m_EyeAxisToString.push_back("FY_3");
	m_EyeAxisToString.push_back("FX_4");
	m_EyeAxisToString.push_back("FY_4");
	m_EyeAxisToString.push_back("FX_5");
	m_EyeAxisToString.push_back("FY_5");
	m_EyeAxisToString.push_back("FX_6");
	m_EyeAxisToString.push_back("FY_6");
	m_EyeAxisToString.push_back("FX_7");
	m_EyeAxisToString.push_back("FY_7");
	m_EyeAxisToString.push_back("FX_8");
	m_EyeAxisToString.push_back("FY_8");
	m_EyeAxisToString.push_back("FX_9");
	m_EyeAxisToString.push_back("FY_9");
	m_EyeAxisToString.push_back("FX_10");
	m_EyeAxisToString.push_back("FY_10");
	m_EyeAxisToString.push_back("FX_11");
	m_EyeAxisToString.push_back("FY_11");
	m_EyeAxisToString.push_back("FX_12");
	m_EyeAxisToString.push_back("FY_12");
	m_EyeAxisToString.push_back("FX_13");
	m_EyeAxisToString.push_back("FY_13");
	m_EyeAxisToString.push_back("FX_14");
	m_EyeAxisToString.push_back("FY_14");
	m_EyeAxisToString.push_back("FX_15");
	m_EyeAxisToString.push_back("FY_15");
	m_EyeAxisToString.push_back("FX_16");
	m_EyeAxisToString.push_back("FY_16");
	m_EyeAxisToString.push_back("FX_17");
	m_EyeAxisToString.push_back("FY_17");
	m_EyeAxisToString.push_back("FX_18");
	m_EyeAxisToString.push_back("FY_18");
	m_EyeAxisToString.push_back("FX_19");
	m_EyeAxisToString.push_back("FY_19");
	m_EyeAxisToString.push_back("FX_20");
	m_EyeAxisToString.push_back("FY_20");
	m_EyeAxisToString.push_back("FX_21");
	m_EyeAxisToString.push_back("FY_21");
	m_EyeAxisToString.push_back("FX_22");
	m_EyeAxisToString.push_back("FY_22");
	m_EyeAxisToString.push_back("FX_23");
	m_EyeAxisToString.push_back("FY_23");
	m_EyeAxisToString.push_back("FX_24");
	m_EyeAxisToString.push_back("FY_24");
	m_EyeAxisToString.push_back("FX_25");
	m_EyeAxisToString.push_back("FY_25");
	m_EyeAxisToString.push_back("FX_26");
	m_EyeAxisToString.push_back("FY_26");
	m_EyeAxisToString.push_back("FX_27");
	m_EyeAxisToString.push_back("FY_27");
	m_EyeAxisToString.push_back("FX_28");
	m_EyeAxisToString.push_back("FY_28");
	m_EyeAxisToString.push_back("FX_29");
	m_EyeAxisToString.push_back("FY_29");
	m_EyeAxisToString.push_back("FX_30");
	m_EyeAxisToString.push_back("FY_30");
	m_EyeAxisToString.push_back("FX_31");
	m_EyeAxisToString.push_back("FY_31");
	m_EyeAxisToString.push_back("FX_32");
	m_EyeAxisToString.push_back("FY_32");
	m_EyeAxisToString.push_back("FX_33");
	m_EyeAxisToString.push_back("FY_33");
	m_EyeAxisToString.push_back("FX_34");
	m_EyeAxisToString.push_back("FY_34");
	m_EyeAxisToString.push_back("FX_35");
	m_EyeAxisToString.push_back("FY_35");
	m_EyeAxisToString.push_back("FX_36");
	m_EyeAxisToString.push_back("FY_36");
	m_EyeAxisToString.push_back("FX_37");
	m_EyeAxisToString.push_back("FY_37");
	m_EyeAxisToString.push_back("FX_38");
	m_EyeAxisToString.push_back("FY_38");
	m_EyeAxisToString.push_back("FX_39");
	m_EyeAxisToString.push_back("FY_39");
	m_EyeAxisToString.push_back("FX_40");
	m_EyeAxisToString.push_back("FY_40");
	m_EyeAxisToString.push_back("FX_41");
	m_EyeAxisToString.push_back("FY_41");
	m_EyeAxisToString.push_back("FX_42");
	m_EyeAxisToString.push_back("FY_42");
	m_EyeAxisToString.push_back("FX_43");
	m_EyeAxisToString.push_back("FY_43");
	m_EyeAxisToString.push_back("FX_44");
	m_EyeAxisToString.push_back("FY_44");
	m_EyeAxisToString.push_back("FX_45");
	m_EyeAxisToString.push_back("FY_45");
	m_EyeAxisToString.push_back("FX_46");
	m_EyeAxisToString.push_back("FY_46");
	m_EyeAxisToString.push_back("FX_47");
	m_EyeAxisToString.push_back("FY_47");
	m_EyeAxisToString.push_back("FX_48");
	m_EyeAxisToString.push_back("FY_48");
	m_EyeAxisToString.push_back("FX_49");
	m_EyeAxisToString.push_back("FY_49");
	m_EyeAxisToString.push_back("FX_50");
	m_EyeAxisToString.push_back("FY_50");
	m_EyeAxisToString.push_back("FX_51");
	m_EyeAxisToString.push_back("FY_51");
	m_EyeAxisToString.push_back("FX_52");
	m_EyeAxisToString.push_back("FY_52");
	m_EyeAxisToString.push_back("FX_53");
	m_EyeAxisToString.push_back("FY_53");
	m_EyeAxisToString.push_back("FX_54");
	m_EyeAxisToString.push_back("FY_54");
	m_EyeAxisToString.push_back("FX_55");
	m_EyeAxisToString.push_back("FY_55");
	m_EyeAxisToString.push_back("FX_56");
	m_EyeAxisToString.push_back("FY_56");
	m_EyeAxisToString.push_back("FX_57");
	m_EyeAxisToString.push_back("FY_57");
	m_EyeAxisToString.push_back("FX_58");
	m_EyeAxisToString.push_back("FY_58");
	m_EyeAxisToString.push_back("FX_59");
	m_EyeAxisToString.push_back("FY_59");
	m_EyeAxisToString.push_back("FX_60");
	m_EyeAxisToString.push_back("FY_60");
	m_EyeAxisToString.push_back("FX_61");
	m_EyeAxisToString.push_back("FY_61");
	m_EyeAxisToString.push_back("FX_62");
	m_EyeAxisToString.push_back("FY_62");
	m_EyeAxisToString.push_back("FX_63");
	m_EyeAxisToString.push_back("FY_63");
	m_EyeAxisToString.push_back("FX_64");
	m_EyeAxisToString.push_back("FY_64");
	m_EyeAxisToString.push_back("FX_65");
	m_EyeAxisToString.push_back("FY_65");
	m_EyeAxisToString.push_back("FX_66");
	m_EyeAxisToString.push_back("FY_66");
	m_EyeAxisToString.push_back("FX_67");
	m_EyeAxisToString.push_back("FY_67");
	m_EyeAxisToString.push_back("EX_0");
	m_EyeAxisToString.push_back("EY_0");
	m_EyeAxisToString.push_back("EX_1");
	m_EyeAxisToString.push_back("EY_1");
	m_EyeAxisToString.push_back("NONE");

	m_ClickAxisToString.push_back("X");
	m_ClickAxisToString.push_back("Y");
	m_ClickAxisToString.push_back("FRAME");
	m_ClickAxisToString.push_back("TYPE");
			
}




Logger *Logger::get() {
    if(m_This == NULL)
        m_This = new Logger();

    return m_This;
}


void Logger::log(const std::vector<float> &eye_positions, 
             const std::vector<int> &click_positions, 
             XMLReader::Click::Axis click_axis, 
             EyeTrackerCSV::Value eye_axis, 
             EyeTrackerCSV::Value ref_point) {


	m_Click.push_back(click_positions);
	m_Features.push_back(eye_positions);
	m_ClicksNames.push_back(m_ClickAxisToString[static_cast<int>(click_axis)]);
	m_FeaturesNames.push_back(m_EyeAxisToString[static_cast<int>(eye_axis)] + "_" + m_EyeAxisToString[static_cast<int>(ref_point)]);

}


void Logger::show_features() {
	if(m_FeaturesNames.size() == 0) return;
	if(m_Features[0].size() == 0) return;


	for(size_t i = 0 ; i < m_Click.size()-1 ; ++i) {
		std::cerr << m_FeaturesNames[i] << ", " << m_ClicksNames[i] << ", ";
	}
	std::cerr << m_FeaturesNames.back() << ", " << m_ClicksNames.back() << std::endl;


	for(size_t r = 0 ; r < m_Features[0].size() ; ++r) {
		for(size_t c = 0 ; c < m_Features.size()-1 ; ++c) {
			std::cerr << m_Features[c][r] << ", " << m_Click[c][r] << ", ";
		}
		std::cerr << m_Features.back()[r] << ", " << m_Click.back()[r] << std::endl;
	}
}


void Logger::log(const std::vector<float> &click_timestamp, const std::vector<float> &frame_number) {
	m_ClickTimestamps = click_timestamp;
	m_FrameNumber = frame_number;
}


void Logger::show_temporal_alignment() {

	std::cerr << "click_timestamp, frame_number\n";
	for(size_t i = 0 ; i < m_FrameNumber.size() ; ++i) {
		std::cerr << m_ClickTimestamps[i] << ", " << m_FrameNumber[i] << "\n";
	}
}







