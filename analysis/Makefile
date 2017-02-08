## Makefile for Feature Extraction and Gaze Prediction ##
# Paths
SRC = microData
FITDST = fitResults
CLMDST = clmResults

# binaries
FIT = Fit/fit
EXTRACT = clmframework/bin/FeatureExtraction

VIDEOS = $(wildcard $(SRC)/*.webm)
CLMOUT = $(patsubst $(SRC)/%.webm, $(CLMDST)/%.csv, $(VIDEOS))
FITOUT = $(patsubst $(SRC)/%.webm, $(FITDST)/%.csv, $(VIDEOS))

.PHONY: all

all: $(FITOUT)

# fitting rule
$(FITDST)/%.csv: $(CLMDST)/%.csv $(SRC)/%.xml
	$(FIT) -f $< -c $(SRC)/$*.xml -o $@

# extraction rule
$(CLMDST)/%.csv: $(SRC)/%.webm
	$(EXTRACT) -ofeatures_2d -f $< $@
