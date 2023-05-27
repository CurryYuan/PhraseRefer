
import os
import json
import time
from utils import get_eta

SCANNET_ROOT = "/data/ANONYMOUS/ScanRefer/ScanNet_frames/"
INPUT_ROOT = os.path.join(SCANNET_ROOT, "{}/pose") # scene_id
INPUT_PATH = os.path.join(INPUT_ROOT, "{}") # scene_id, pose_id
OUTPUT_PATH = os.path.join(SCANNET_ROOT, "{}/all_pose.json") # scene_id

def decode_pose(scene_id, pose_file):
    decoded = []
    with open(INPUT_PATH.format(scene_id, pose_file)) as f:
        for line in f.readlines():
            decoded += line.strip("\n").strip("\t").split(" ")

    return decoded

def get_scene_list():
    return sorted(os.listdir(SCANNET_ROOT))

def get_pose_list(scene_id):
    return os.listdir(INPUT_ROOT.format(scene_id))

def aggregate_pose():
    scene_list = get_scene_list()

    logging_file = open('without_pose.log', 'w')

    for i, scene_id in enumerate(scene_list):
        if os.path.exists(os.path.join(OUTPUT_PATH.format(scene_id))): 
            print("skipping {}...".format(scene_id))
            continue

        start = time.time()
        aggregated = {}

        try:
            pose_list = sorted(get_pose_list(scene_id), key=lambda x: int(x.split(".")[0]))
        except:
            print(scene_id)
            logging_file.write(scene_id)
            continue

        for pose_file in pose_list:
            pose_id = int(pose_file.split(".")[0])
            decoded = decode_pose(scene_id, pose_file)
            if "-inf" not in decoded:
                aggregated[pose_id] = [float(item) for item in decoded]

        with open(OUTPUT_PATH.format(scene_id), "w") as f:
            json.dump(aggregated, f, indent=4)

        num_left = len(scene_list) - i - 1
        eta = get_eta(start, time.time(), 0, num_left)
        print("processed {}, {} left, ETA: {}h {}m {}s".format(scene_id, num_left, eta["h"], eta["m"], eta["s"]))
    
    print("done!")

if __name__ == "__main__":
    aggregate_pose()