#!/bin/bash
#width=720
#height=576
width=640
height=480
framerate=25

vlc --demux rawvideo --rawvid-fps ${framerate} \
 --rawvid-width ${width} --rawvid-height ${height} \
 --rawvid-chroma I420 ${1}
