#!/usr/bin/env python2
import json

foo = []
with open('aux.json') as f:
    for line in f:
        foo.append(json.loads(line))

data = foo[0]

#print(len(data))
filtered = []
tokens = []
for i in range(len(data)):
    item = data[i]
    steps = item["steps"]
    userId = item["userId"]
    token = item["token"]
    if (len(token) > 5 and len(token) < 10 and not token.startswith("test")):
        entry = {}
        entry["userId"] = userId

        try:
            index = tokens.index(token)
            filtered[index].update(entry)
            continue

        except ValueError as error:
            pass

        filtered.append(item)
        tokens.append(token)
        print "---------"
        print token
        print userId
        for step in steps:
            print step["name"]

print len(filtered)
