# some pythony helpers
import csv
import errno
import xml.etree.ElementTree
from os import path, makedirs
from collections import namedtuple

# Create directories recursively in python 2
def mkdir_p(dirpath):
    try:
        makedirs(dirpath)
    except OSError as exc:  # Python >2.5
        if exc.errno == errno.EEXIST and path.isdir(dirpath):
            pass
        else:
            raise

def softFloat(val):
    if (val == ""):
        return None
    else:
        return float(val)

# Trim array items
def trim(arr):
    return map(lambda item: item.strip(), arr)

# Convert array items to float
def toFloat(arr):
    return map(lambda item: softFloat(item), arr)

# Read csv into a namedtuple list
def parseCSV(filename, makeFloat=False):
    data = []
    csvfile = open(filename, "rb")
    reader = csv.reader(csvfile, delimiter=",")

    # assumes header row with column names
    names = reader.next();
    Row = namedtuple("Row", trim(names))

    for row in reader:
        values = trim(row)
        if makeFloat:
            values = toFloat(values)
        data.append(Row(*values))
    csvfile.close()
    return data

# XML parsing
Video = namedtuple("Video", ["start", "end", "width", "height", "title"])
VideoRow = namedtuple("VideoRow", ["frame", "x", "y", "cX", "cY"])
def parseXML(filename):
    clicktimes = []
    videos = []
    root = xml.etree.ElementTree.parse(filename).getroot()

    title = None
    start = None
    for click in root.findall("click"):
        clicktimes.append(int(click.get("time")))

        for child in click:
            if (child.tag == "videoStart"):
                title = child.get("file")
                start = int(child.get("time"))

            elif (title is not None and child.tag == "videoEnd"):
                videos.append(Video(
                    title = title,
                    start = start,
                    width = int(child.get("width")),
                    height = int(child.get("height")),
                    end = int(child.get("time"))
                ))

    return videos, clicktimes

