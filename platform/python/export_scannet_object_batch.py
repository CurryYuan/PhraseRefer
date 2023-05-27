import os
import time
import argparse
import subprocess
from utils import get_eta
import pdb

# INPUT_ROOT = "/mnt/canis/Datasets/ScanNet/public/v1/scans/"
INPUT_ROOT = "/data/dataset/scannet/scans/"
OUTPUT_ROOT = "/home/ANONYMOUS/ScanRefer/ScanNet_objects"

def get_all_scene():
    return sorted(os.listdir(INPUT_ROOT))

if __name__ == "__main__":
    all_scene = get_all_scene()
    for i, scene in enumerate(all_scene):
        if os.path.exists(os.path.join(OUTPUT_ROOT, scene)): continue
        start = time.time()
        cmd = ["python", "export_scannet_object.py", "--scene_id", scene]
        # _ = subprocess.call(cmd, stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
        _ = subprocess.call(cmd)

        # verbose
        num_left = len(all_scene) - i - 1
        eta = get_eta(start, time.time(), 0, num_left)
        print("extracted objects in {}, {} scenes left, ETA: {}h {}m {}s".format(
            scene,
            num_left,
            eta["h"],
            eta["m"],
            eta["s"]
        ))

    print("done!")