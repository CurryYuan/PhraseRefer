import os
import json
# import spacy
from datetime import datetime
from pymongo import MongoClient

OUTPUT_PATH = "server/backup/{}.json" # time stamp
MONGODB_URL = "mongodb://scanreferUser:intum3d@127.0.0.1:27017/mesh2cap"
MONGODB_NAME = "mesh2cap"
COLLECTION_NAME = "Mesh2Cap"
SCAN_ID = "00"
BAD_FIX = ["..."]
# LANG = spacy.load("en_core_web_lg")

def get_collection():
    client = MongoClient(MONGODB_URL)
    db = client[MONGODB_NAME]
    collection = db[COLLECTION_NAME]
    
    return collection

def export(collection):
    # get all annotations
    query = {}
    results = []
    count = {
        "num": 0,
        "reworded": 0,
        "scene": {},
        "object": {}
    }

    print("exporting...")
    for doc in collection.find(query):
        objectives = set(["scene_id", "object_id", "anno_id", "object_name", "camera", "description", "status", "annotate", "verify"])
        keys = set([key for key in doc.keys() if key != "_id"])

        if keys != objectives: 
            continue

        if doc["scene_id"].split("_")[-1] == SCAN_ID and doc["verify"]:
            doc.pop("_id", None)

            # # apply the reworded descriptions
            # if doc["verify"]["reworded"] and doc["verify"]["reworded"] not in BAD_FIX:
            #     description = doc["verify"]["reworded"].lower()
            #     count["reworded"] += 1
            # else:
            #     description = doc["description"].lower()
            description = doc["description"].lower()

            # # tokenize
            # doc["token"] = [str(t.text) for t in LANG(description)]

            # dump
            results.append(doc)
            count["num"] += 1

            if doc["scene_id"] not in count["scene"]:
                count["scene"][doc["scene_id"]] = 1

            if "{}_{}".format(doc["scene_id"], doc["object_id"]) not in count["object"]:
                count["object"]["{}_{}".format(doc["scene_id"], doc["object_id"])] = 1

    print("found {} valid annotation from {} scenes for {} objects".format(count["num"], sum([v for _, v in count["scene"].items()]), sum([v for _, v in count["object"].items()])))
    print("{} objects per scene".format(round(sum([v for _, v in count["object"].items()]) / sum([v for _, v in count["scene"].items()]), 2)))
    print("{} annotations per scene".format(round(count["num"] / sum([v for _, v in count["scene"].items()]), 2)))
    print("each object has {} annotations".format(round(count["num"] / sum([v for _, v in count["object"].items()]), 2)))
    print("{} reworded descriptions".format(count["reworded"]))

    # dump
    stamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    with open(OUTPUT_PATH.format(stamp), "w") as f:
        json.dump(results, f, indent=4)


if __name__ == "__main__":
    collection = get_collection()
    export(collection)
    
    print("done!")
