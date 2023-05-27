import os
import time
import argparse
import subprocess

from utils import get_eta
from multiprocessing import Pool, Queue
import pdb

def main(args, scene_list):

    # setting
    if not os.path.exists(OUTPUT_ROOT):
        os.mkdir(OUTPUT_ROOT)
    
    for i, scene_id in enumerate(scene_list):
        if scene_id.endswith('.txt'):
            continue
        
        if os.path.exists(os.path.join(OUTPUT_ROOT, scene_id)): 
            print("skipping {}...".format(scene_id))
            
        filename = os.path.join(SCANNET_ROOT, scene_id, SCANNET_SENS.format(scene_id))
        output_path = os.path.join(OUTPUT_ROOT, scene_id)
        os.makedirs(output_path, exist_ok=True)
        cmd_line = [
            "python", "reader.py",
            "--filename", filename,
            "--output_path", output_path
        ]
        # export_color_images
        if args.color and "color" not in os.listdir(output_path):
            cmd_line.append("--export_color_images")
            color_flag = True
        else:
            color_flag = False
        # export_depth_images
        if args.depth and "depth" not in os.listdir(output_path):
            cmd_line.append("--export_depth_images")
            depth_flag = True
        else:
            depth_flag = False
        # export_poses
        if args.pose and "pose" not in os.listdir(output_path):
            cmd_line.append("--export_poses")
            pose_flag = True
        else:
            pose_flag = False
        
        # skip if exists
        if (not color_flag) and (not depth_flag) and (not pose_flag):
            print("skipping {}".format(scene_id))
            continue

        # run
        print("parsing sensor frames of {}...".format(scene_id), end="")
        start = time.time()
        if args.verbose:
            _ = subprocess.call(
                cmd_line
            )
        else:
            _ = subprocess.call(
                cmd_line, 
                stderr=subprocess.DEVNULL,
                stdout=subprocess.DEVNULL
            )
        

        # report
        num_left = len(scene_list) - i - 1
        eta = get_eta(start, time.time(), 0, num_left)
        print("complete! {} left, ETA: {}h {}m {}s".format(
            num_left,
            eta["h"],
            eta["m"],
            eta["s"]
        ))

    print("done!")

if __name__ == "__main__":
    # read args
    
    parser = argparse.ArgumentParser()
    parser.add_argument("--scene_id", type=str, default="-1")
    parser.add_argument("--color", action="store_true")
    parser.add_argument("--depth", action="store_true")
    parser.add_argument("--pose", action="store_true")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()
    
    INPUT_ROOT = "/home/ANONYMOUS/ScanRefer/scans/"
    SCANNET_ROOT = "/data/dataset/scannet/scans/"
    SCANNET_SENS = "{}.sens" # scene_id
    RAID_ROOT = "/data/ANONYMOUS/ScanRefer/"  # TODO change this
    OUTPUT_ROOT = os.path.join(RAID_ROOT, "ScanNet_frames")

    scene_list = os.listdir(INPUT_ROOT)
    

    # ababa_path = ['scene0502_00', 'scene0087_01', 'scene0537_00', 'scene0557_02', 'scene0254_00', 'scene0580_00', 'scene0695_03', 'scene0088_01', 'scene0035_00', 'scene0335_01', 'scene0686_00', 'scene0552_01', 'scene0328_00', 'scene0536_00', 'scene0469_00', 'scene0576_00', 'scene0357_00', 'scene0137_02', 'scene0286_00', 'scene0091_00', 'scene0440_00', 'scene0441_00']
    ababa_path = ['scene0032_00','scene0032_01','scene0033_00','scene0034_00','scene0034_01','scene0034_02']

    num_workers = 6
    # main(args, scene_list)
    p = Pool(num_workers)
    
    for i in range(num_workers):
        start = int(i)*1
        end = int(i+1)*1
        p.apply_async(main, args=(args, ababa_path[start:end],))

    p.close()
    p.join()
