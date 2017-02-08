#!/bin/bash
# split CSV-files for every .csv in $CSVDIR
# resulting files are output to $OUTDIR

CSVDIR=../fitResults
OUTDIR=../videoResults

csvs="${CSVDIR}/*.csv"
for csv in $csvs; do
  echo "./splitcsv -c ${csv} -o ${OUTDIR}"
  ./splitcsv -c ${csv} -o ${OUTDIR}
done
