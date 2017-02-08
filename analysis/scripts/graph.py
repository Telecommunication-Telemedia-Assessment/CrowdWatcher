#!/usr/bin/python2
import os
from os import path
from subprocess import call
import numpy as np
import matplotlib.pyplot as plt
import itertools

FG_GREEN='\033[01;32m'
FG_RED='\033[01;31m'
FG_RESET='\033[00m'

def info_msg(msg):
    print(FG_GREEN + msg + FG_RESET)

def error_msg(msg):
    print(FG_RED + msg + FG_RESET)

def parse(result, resultPath):
    info_msg("Parsing %s" % result)

    values = {"name": path.splitext(result)[0]}
    headers = None
    resultfile = path.join(resultPath, result)
    file = open(resultfile, "r");
    for line in file:
        data = list(x.strip() for x in line.split(","))
        if (headers is None):
            headers = data
            for x in headers:
                values[x] = []
        else:
            for i in range(len(data)):
                values[headers[i]].append(float(data[i]))

    print("values", values)
    return values


def load(resultPath):
    files = os.listdir(resultPath)
    results = list(x for x in files if x.endswith(".txt"))
    print("results", results);

    def foo(axis, errAxis, type=0, spec=""):
        plt.grid(True, 'major', 'both')
        #plt.legend(legend)
        plt.title("x-Axis Prediction Error")
        plt.ylabel("Pixels")
        plt.xlabel("Frames")
        for i in range(1):
            values = parse(results[i], resultPath)
            frames = []
            vals = []
            errs = []
            for j in range(len(values["frame"])):
                if (int(values["distraction"][j]) == type):
                    vals.append(values["frame"][j])
                    errs.append(values["x"][j])
                    frames.append(values["y"][j])
                print('huhu', frames, vals)
                plt.plot(frames, vals, spec)
                plt.errorbar(frames, vals, yerr=errs, fmt='--o')

    #for i in range(len(results)):
    #    name = values["name"]
    #    if (1 in values["distraction"]):
    #        name += " D"
    #    legend.append(name)
    #    legend.append("distractions")

    rows = 2
    #fig = plt.figure(facecolor="white")
    plt.subplot(rows, 1, 1, axisbg="#eeeeee")
    foo("x", "CI_x")

    #plt.subplot(rows, 1, 2, axisbg="#eeeeee")
    #plt.plot(*y)
    #plt.grid(True, 'major', 'both')
    #plt.legend(legend)
    #plt.title("y-Axis Prediction Error")
    #plt.ylabel("Pixels")
    #plt.xlabel("Frames")

    plt.tight_layout()
    plt.show()

load("./results")
