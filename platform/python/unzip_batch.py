import os
import time
import argparse
import subprocess
from utils import get_eta
import pdb

# INPUT_ROOT = "/mnt/canis/Datasets/ScanNet/public/v1/scans/"
INPUT_ROOT = "/data/dataset/scannet/scans/"
OUTPUT_ROOT = "/home/ANONYMOUS/ScanRefer/scans"

def get_all_scene(INPUT_ROOT):
    return sorted(os.listdir(INPUT_ROOT))

def unzip():

    all_scene = get_all_scene()
    for i, scene in enumerate(all_scene):
        instance_input_path = INPUT_ROOT + scene + "/" + scene + "_2d-instance-filt.zip"

        if not os.path.exists(os.path.join(OUTPUT_ROOT, scene)): 
            print(os.path.join(OUTPUT_ROOT, scene))
            os.makedirs(OUTPUT_ROOT+"/"+scene)

        instance_output_path = INPUT_ROOT+scene+'/'
        cmd = ["sudo", "unzip", '-n', instance_input_path, '-d', instance_output_path]
        _ = subprocess.call(cmd)

    print("done!")

def decopy():

    scans_path = '/home/ANONYMOUS/ScanRefer/scans/'
    scans_frames = '/data/ANONYMOUS/ScanRefer/ScanNet_frames/'

    scans_list = get_all_scene(scans_path)
    scans__frames_list = get_all_scene(scans_frames)

    print(len(scans_list))
    print(len(scans__frames_list))

    print(set(scans_list).difference(set(scans__frames_list)))

if __name__ == "__main__":
    decopy()