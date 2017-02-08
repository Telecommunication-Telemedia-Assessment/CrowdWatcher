CC = g++
CFLAGS = -W -Wall -g \
			 -I/usr/include/opencv \
			 -I/usr/include/boost \
			 -I/usr/include/eigen3

LDFLAGS = -L/usr/local/opt/boost/lib \
		  -L/usr/local/opt/opencv3/lib \
		  -lopencv_core -lopencv_imgproc -lopencv_objdetect -lopencv_highgui -lopencv_videoio \
		  -lboost_regex -lboost_program_options

SRC = $(wildcard *.cpp)
OBJS = $(SRC:.cpp=.o)
AOUT = fit


all : $(AOUT)

fit : $(OBJS)
	$(CC) $(LDFLAGS) -o $@ $^
%.o : %.cpp
	$(CC) $(CFLAGS) -o $@ -c $<
clean :
	@rm *.o
cleaner : clean
	@rm $(AOUT)
