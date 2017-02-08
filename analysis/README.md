# eyetracking-plattform

# Requirements
## Feature Extraction
  - boost
  - opencv

## Fitting application
  - boost
  - opencv
  - point clould library: pcl

## Saliency Map Creation
  - >=python2.7.9
  - opencv with python2 bindings
  - numpy
  - scipy
  - processing

# Usage
  - configure your paths in the Makefile
  - download xml + videodata (webm) to your data directory
  - use make

# Processing
## Feature Extraction
  - using the Cambridge CLM-framework
  - modified to interpret colored 16x16px box markers in the upper-left corner,
    which mark index frames in the video
    - frames directly following the index frame are also colored in a fixed manner
      to ensure detection also in case of dropped frames during encoding.
    - color progression:
      - red      #ff0000 - Index Frame
      - green    #008000 - 1st after
      - blue     #0000ff - 2nd after
      - yellow   #ffff00 - 3rd ...
      - brown    #a52A2a - 4th
      - hotpink  #ff6984 - 5th
      - orange   #ffa500 - 6th
      - purple   #800080 - 7th
      - salmon   #fa8072 - 8th

  - the feature data is output together with the index frame information as CSV

## Fitting
  - the fitting application reads the uploaded XML + the CSV to predict the
    participants fixation
  - the fixation data is output together with prediction-error and metadata as CSV

## Saliency Map Creation
  - 0) videos and XML files obtained from the web platform should be located in the folder "microData"
  - 1) Run the Makefile using make. This will process the videos (using the CLM-framework) and perform the fixation predictions (using the fit algorithm) with their respective accuracy (when available). Intermediate results from the CLM-framework will be placed in the folder "clmResults". The predictions results will be in the folder "fitResults". 
  - 2) run script/createSplits.sh to extract the fixation predictions corresponding to each video seen by each participants. Result of this processing will take the form of several folders for each PVSs seen by the observers. Folders such as "encodedSRC17_HRC03" will then be created containing the individual results of each participants
  - 3) run script/createMaps.sh to estimate the saliency maps from the different fixation predictions files. The result of this script will be .yuv videos in the folder "maps"
