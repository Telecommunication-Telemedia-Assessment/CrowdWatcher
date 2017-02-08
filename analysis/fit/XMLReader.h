#ifndef _XMLReader_
#define _XMLReader_

#include <string>
#include <vector>

class XMLReader {
	std::vector< int >		clickX;
	std::vector< int >		clickY;
	std::vector< int >		click_frame;
	std::vector< int >		click_type;

	std::vector< std::string> events;
	std::vector< int >		events_frame;


public:

	struct Click {
		enum Axis {
			X = 0,
			Y,
			FRAME,
			TYPE
		};
	};


	bool									open			(const std::string& filename, int frameRate = 25);
	const std::vector< int >				&get			(Click::Axis value) const;
	inline const std::vector< std::string > &getEvent		()					const			{return events; }
	inline const std::vector< int >			&getEventFrames ()					const			{return events_frame; }

};

#endif
