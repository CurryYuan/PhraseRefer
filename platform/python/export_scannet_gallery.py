import os
import time
import json
import numpy as np
from PIL import Image
from collections import Counter
from utils import get_eta

# INPUT_ROOT = "/data/dataset/scannet/scans/"
# OUTPUT_ROOT = "/home/ANONYMOUS/ScanRefer/ScanNet_objects"


PROJECTION_ROOT = "/data/dataset/scannet/scans/"
PROJECTION_FILT = os.path.join(PROJECTION_ROOT, "{}/instance-filt")
PROJECTION_IMG = os.path.join(PROJECTION_FILT, "{}.png")
# SCANNET_ROOT = "/mnt/canis/Datasets/ScanNet/public/v2/scans/"
SCANNET_ROOT = INPUT_ROOT = "/data/dataset/scannet/scans/"
AGGR_JSON = os.path.join(SCANNET_ROOT, "{}/{}.aggregation.json")
OUTPUT_ROOT = "/home/ANONYMOUS/ScanRefer/ScanNet_galleries/"
OUTPUT_PATH = os.path.join(OUTPUT_ROOT, "{}.json")

if __name__ == "__main__":
    scene_list = sorted(os.listdir(PROJECTION_ROOT))
    print(scene_list)
    for i, scene_id in enumerate(scene_list):
        if scene_id.endswith('.txt'):
            continue

        if os.path.exists(os.path.join(OUTPUT_PATH.format(scene_id))): 
            print("skipping {}...".format(scene_id))
            continue

        start = time.time()
        pose_list = [int(item.split(".")[0]) for item in os.listdir(PROJECTION_FILT.format(scene_id))]
        with open(AGGR_JSON.format(scene_id, scene_id)) as aggr_json:
            aggr_json = json.load(aggr_json)
            num_object = len(aggr_json["segGroups"])
            object_list = [seg["objectId"] for seg in aggr_json["segGroups"]]
            object_matrix = np.zeros((max(pose_list) + 1, num_object))
            object_gallery = {}
            # count objects
            for j, pose_id in enumerate(pose_list):
                pose_img = Image.open(PROJECTION_IMG.format(scene_id, pose_id))
                ins_list = np.array(pose_img).reshape((-1)).tolist()
                ins_count = dict(Counter(ins_list))
                for key, value in ins_count.items():
                    if key > 0 and key - 1 in object_list:
                        object_matrix[pose_id, key - 1] = value

            # aggregate object_gallery
            for object_id in range(num_object):
                ins_count_list = [item for item in enumerate(object_matrix[:, object_id].tolist())]
                ins_count_list = sorted(ins_count_list, key=lambda x: x[1], reverse=True)
                object_gallery[object_id] = [i for i, item in ins_count_list if item != 0]

            # export
            os.makedirs(OUTPUT_ROOT, exist_ok=True)
            with open(OUTPUT_PATH.format(scene_id), "w") as output_json:
                json.dump(object_gallery, output_json, indent=4)

        # verbose
        num_left = len(scene_list) - i - 1
        eta = get_eta(start, time.time(), 0, num_left)
        print("processed {}, {} left, ETA: {}h {}m {}s".format(
            scene_id,
            num_left,
            eta["h"],
            eta["m"],
            eta["s"]
        ))
    
    print("done!")

