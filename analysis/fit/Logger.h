#ifndef _Logger_
#define _Logger_

#include <vector>

#include "XMLReader.h"
#include "Predictor.h"


class Logger {


public:


    // ----------------------------------------------------------------------------------------------
    // member functions
    static Logger* get              ();
    virtual ~Logger                 () {};



    void log(const std::vector<float> &eye_positions, 
             const std::vector<int> &click_positions, 
             XMLReader::Click::Axis click_axis, 
             EyeTrackerCSV::Value eye_axis, 
             EyeTrackerCSV::Value ref_point);


    void log(const std::vector<float> &click_timestamp, const std::vector<float> &frame_number);


    void show_features();
    void show_temporal_alignment();

private:

    // ----------------------------------------------------------------------------------------------
	Logger();



    // ----------------------------------------------------------------------------------------------
    // member variables
    static Logger *m_This;


    std::vector< std::string >        m_EyeAxisToString;
    std::vector< std::string >        m_ClickAxisToString;


    std::vector< std::string >        m_FeaturesNames;
    std::vector< std::string >        m_ClicksNames; 
    std::vector< std::vector<float> > m_Features;
    std::vector< std::vector<int> >   m_Click;

    std::vector< float >              m_ClickTimestamps;
    std::vector< float >              m_FrameNumber;

};



#endif



