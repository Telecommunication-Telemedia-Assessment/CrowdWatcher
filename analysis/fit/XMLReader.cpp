#include "XMLReader.h"

#include <boost/property_tree/xml_parser.hpp>
#include <boost/foreach.hpp>
#include <boost/lexical_cast.hpp>
#include <boost/shared_ptr.hpp>
#include <boost/format.hpp>

inline const boost::property_tree::ptree &empty_ptree() {
	static boost::property_tree::ptree pt;
	return pt;
}


bool XMLReader::open(const std::string& filename, int frameRate) {

	using namespace boost;
	using namespace boost::property_tree;

	boost::property_tree::ptree trackingLog;
	boost::property_tree::read_xml(filename, trackingLog);

	const ptree & formats = trackingLog.get_child("EyeTrackingRecords", empty_ptree());

	long initTime = -1;
	BOOST_FOREACH(const ptree::value_type &f, formats){

		const ptree & attributes = f.second.get_child("<xmlattr>", empty_ptree());
		int frameNumber = -1;


		long time = attributes.get<long long>("time", 0);
		if(initTime == -1)
			initTime = time;

		frameNumber = static_cast<int>((time - initTime) / 10000. * 3 * frameRate);

		int x = attributes.get<int>("x", -1);
		int y = attributes.get<int>("y", -1);

		click_frame.push_back(frameNumber);
		clickX.push_back(x);
		clickY.push_back(y);
    click_type.push_back(0);

		BOOST_FOREACH(const ptree::value_type &v_obj, f.second) {
			if (v_obj.first == "newPage") {
				time = v_obj.second.get<long long>("<xmlattr>.time", 0);
				frameNumber = static_cast<int>((time - initTime) / 10000. * 3 * frameRate);
				events.push_back(v_obj.second.get<std::string>("<xmlattr>.name", ""));
				events_frame.push_back(frameNumber);

			} else if (v_obj.first == "videoStart") {
				time = v_obj.second.get<long long>("<xmlattr>.time", 0);
				frameNumber = static_cast<int>((time - initTime) / 10000. * 3 * frameRate);
				events.push_back(v_obj.first + ":" + v_obj.second.get<std::string>("<xmlattr>.file", ""));
				events_frame.push_back(frameNumber);

			} else if (v_obj.first == "videoEnd") {
				time = v_obj.second.get<long long>("<xmlattr>.time", 0);
				frameNumber = static_cast<int>((time - initTime) / 10000. * 3 * frameRate);
				events.push_back(v_obj.first);
				events_frame.push_back(frameNumber);

			// TODO: handle scroll Events and move frame of reference
			} else if (v_obj.first == "scrollTo") {
				time = v_obj.second.get<long long>("<xmlattr>.time", 0);
				frameNumber = static_cast<int>((time - initTime) / 10000. * 3 * frameRate);

			} else if (v_obj.first == "distraction") {
				time = v_obj.second.get<long long>("<xmlattr>.time", 0);
				x = attributes.get<int>("x", -1);
				y = attributes.get<int>("y", -1);
				frameNumber = static_cast<int>((time - initTime) / 10000. * 3 * frameRate);

				click_frame.push_back(frameNumber);
				clickX.push_back(x);
				clickY.push_back(y);
				click_type.push_back(1);
			}
		}
	}

	return initTime != -1;
}

const std::vector< int > &XMLReader::get(Click::Axis value) const {
	switch(value) {
		case Click::X:
			return clickX;

		case Click::Y:
			return clickY;

		case Click::FRAME:
			return click_frame;

		case Click::TYPE:
			return click_type;
	}

	throw std::logic_error( "XMLReader::get : This is not a valid axis!" );
	return clickX;
}
