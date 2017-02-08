#!/bin/bash
# create saliency maps for every video directory in $VIDEOCSVDIR
# saliency maps are output to $MAPDIR

VIDEOCSVDIR=../videoResults
MAPDIR=../maps

dirs="${VIDEOCSVDIR}/*"
for dir in $dirs; do
  video=${dir##*/}
  [ ! -d "${dir}" ] && continue
  csvs="${dir}/*.csv"
  map="${MAPDIR}/${video}.yuv"
  echo "./createmap -s ../microData/ -o ${map} ${csvs}"
  ./createmap -s ../microData/ -o ${map} ${csvs}
done
