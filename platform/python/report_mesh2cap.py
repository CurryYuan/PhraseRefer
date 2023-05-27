import os
import json
import argparse
import numpy as np
from datetime import datetime
from pymongo import MongoClient
from itertools import chain

# OUTPUT_PATH = "server/backup/{}.json" # time stamp
SCANNETV2 = "data/scannetv2-labels.combined.tsv"
NYUCLASSES = ['cabinet', 'bed', 'chair', 'sofa', 'table', 'door', 'window', 'bookshelf', 'picture', 'counter', 'desk', 'curtain', 'refridgerator', 'bathtub', 'shower curtain', 'toilet', 'sink', 'others']
NUM_CLASSES = len(NYUCLASSES)
MONGODB_URL = "mongodb://scanreferUser:intum3d@127.0.0.1:27017/mesh2cap"
MONGODB_NAME = "mesh2cap"
COLLECTION_NAME = "Mesh2Cap"
SCAN_ID = "00"
BAD_FIX = ["..."]

def get_collection():
    client = MongoClient(MONGODB_URL)
    db = client[MONGODB_NAME]
    collection = db[COLLECTION_NAME]
    
    return collection

def get_raw2nyu():
    lines = [line.rstrip() for line in open(SCANNETV2)]
    lines = lines[1:]
    raw2nyu = {}
    for i in range(len(lines)):
        label_classes_set = set(NYUCLASSES)
        elements = lines[i].split('\t')
        raw_name = elements[1]
        nyu40_name = elements[7]
        if nyu40_name not in label_classes_set:
            raw2nyu[raw_name] = 'others'
        else:
            raw2nyu[raw_name] = nyu40_name
    
    return raw2nyu

def export(args, collection):
    # get all annotations
    query = {}
    results = {"data": []}
    count = {
        "num": 0,
        "scene": {},
        "object": {},
        "des_len": [],
        "words": [],
        "verified": 0,
        "ambiguous": 0,
        "reworded": 0,
        "wrong": 0
    }
    cat_in_scene = {}
    dist, dist_raw = {}, {}
    raw2nyu = get_raw2nyu()
    cached = []
    for doc in collection.find(query):
        objectives = set(["scene_id", "object_id", "anno_id", "object_name", "camera", "description", "status", "annotate", "verify"])
        keys = set([key for key in doc.keys() if key != "_id"])

        if keys != objectives: 
            continue

        if doc["scene_id"].split("_")[-1] == SCAN_ID:
            doc.pop("_id", None)

            # dump
            results["data"].append(doc)
            count["num"] += 1

            if doc["scene_id"] not in count["scene"]:
                count["scene"][doc["scene_id"]] = 1

            if "{}_{}".format(doc["scene_id"], doc["object_id"]) not in count["object"]:
                count["object"]["{}_{}".format(doc["scene_id"], doc["object_id"])] = 1

            # store description length
            count["words"] += doc["description"].split(" ")
            count["des_len"].append(len(doc["description"].split(" ")))

            if doc["verify"]["selected_in_scene"] and doc["verify"]["reworded"] not in BAD_FIX:
                count["verified"] += 1

            if doc["verify"]["selected_in_scene"] and doc["object_id"] != doc["verify"]["selected_in_scene"]:
                count["ambiguous"] += 1

            if doc["verify"]["selected_in_scene"] and doc["object_id"] not in doc["verify"]["selected_in_scene"].split(" "):
                count["wrong"] += 1

            if doc["verify"]["reworded"] and doc["verify"]["reworded"] not in BAD_FIX:
                count["reworded"] += 1

            # category
            raw = " ".join(doc["object_name"].split("_"))
            
            if raw not in dist_raw:
                dist_raw[raw] = 0
            dist_raw[raw] += 1

            nyu = raw2nyu[raw]
            if nyu not in dist:
                dist[nyu] = 0
            dist[nyu] += 1

            # category per scene
            if doc["scene_id"] not in cat_in_scene:
                cat_in_scene[doc["scene_id"]] = {}

            log = doc["scene_id"] + doc["object_id"]
            if log not in cached:
                if nyu not in cat_in_scene[doc["scene_id"]]:
                    cat_in_scene[doc["scene_id"]][nyu] = 1
                else:
                    cat_in_scene[doc["scene_id"]][nyu] += 1
                
                cached.append(log)

    cat_per_scene = {cat: [] for cat in NYUCLASSES}
    for scene_id in cat_in_scene:
        for cat in NYUCLASSES:
            try:
                cat_per_scene[cat].append(cat_in_scene[scene_id][cat])
            except KeyError:
                # cat_per_scene[cat].append(0)
                pass

    print("found {} valid annotation from {} scenes for {} objects".format(count["num"], sum([v for _, v in count["scene"].items()]), sum([v for _, v in count["object"].items()])))
    print("{} objects per scene".format(round(sum([v for _, v in count["object"].items()]) / sum([v for _, v in count["scene"].items()]), 2)))
    print("{} annotations per scene".format(round(count["num"] / sum([v for _, v in count["scene"].items()]), 2)))
    print("each object has {} annotations".format(round(count["num"] / sum([v for _, v in count["object"].items()]), 2)))
    print("description length min/max/average: {}/{}/{}".format(min(count["des_len"]), max(count["des_len"]), np.mean(count["des_len"])))
    print("vocabulary size: {}".format(len(set(count["words"]))))
    print("verified descriptions: {}".format(count["verified"]))
    print("ambiguous/unambiguous: {}/{}".format(count["ambiguous"], count["num"] - count["ambiguous"]))
    print("wrong descriptions: {}".format(count["wrong"]))
    print("reworded descriptions: {}".format(count["reworded"]))

    sorted_dict = sorted([(k, v) for k, v in dist.items()], key=lambda x: x[1], reverse=True)
    sorted_dict = {k: v for k, v in sorted_dict}
    print("\nnumber of categories: {}".format(len(sorted_dict.keys())))
    print("category distribution:")
    for i, key in enumerate(sorted_dict.keys()):
        # if i < args.num:
        print("{}: {}".format(key, sorted_dict[key]))

    sorted_dict = sorted([(k, v) for k, v in dist_raw.items() if raw2nyu[k] == "others"], key=lambda x: x[1], reverse=True)
    sorted_dict = {k: v for k, v in sorted_dict}
    print("\nnumber of categories: {}".format(len(sorted_dict.keys())))
    print("category distribution:")
    for i, key in enumerate(sorted_dict.keys()):
        if i < args.num:
            print("{}: {}".format(key, sorted_dict[key]))

    print("\ncategories per scene")
    for cat in cat_per_scene:
        print("min/max/average number of object for {} per scene: {}/{}/{}".format(
            cat, min(cat_per_scene[cat]), max(cat_per_scene[cat]), np.mean(cat_per_scene[cat])
        ))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--num", type=int, default=-1, help="Number of categories for display")
    args = parser.parse_args()

    collection = get_collection()
    export(args, collection)
    
    print("done!")
