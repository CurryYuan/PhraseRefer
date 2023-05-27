import os
import time
import argparse

from PIL import Image
from utils import get_eta
from tqdm import tqdm

FRAME_ROOT = "/mnt/raid/davech2y/ScanNet_frames" # scene_id
FRAME_COLOR_ROOT = os.path.join(FRAME_ROOT, "{}/color") # scene_id
FRAME_PATH = os.path.join(FRAME_COLOR_ROOT, "{}") # frame_file
OUTPUT_FRAME_ROOT = os.path.join(FRAME_ROOT, "{}/reduced") # scene_id
OUTPUT_FRAME_PATH = os.path.join(OUTPUT_FRAME_ROOT, "{}") # frame_file
PROJECTION_ROOT = "/mnt/raid/davech2y/ScanNet_projections" # scene_id
PROJECTION_INS_ROOT = os.path.join(PROJECTION_ROOT, "{}/instance-filt") # scene_id
PROJECTION_PATH = os.path.join(PROJECTION_INS_ROOT, "{}") # proj_file
OUTPUT_PROJECTION_ROOT = os.path.join(PROJECTION_ROOT, "{}/reduced") # scene_id
OUTPUT_PROJECTION_PATH = os.path.join(OUTPUT_PROJECTION_ROOT, "{}") # frame_file
WIDTH = 480
HEIGHT = 360
CONFIG = {
    "frame": {
        "input_root": FRAME_ROOT,
        "input_sub_root": FRAME_COLOR_ROOT,
        "input_path": FRAME_PATH,
        "output_root": OUTPUT_FRAME_ROOT,
        "output_path": OUTPUT_FRAME_PATH,
        "width": WIDTH,
        "height": HEIGHT
    },
    "projection": {
        "input_root": PROJECTION_ROOT,
        "input_sub_root": PROJECTION_INS_ROOT,
        "input_path": PROJECTION_PATH,
        "output_root": OUTPUT_PROJECTION_ROOT,
        "output_path": OUTPUT_PROJECTION_PATH,
        "width": WIDTH,
        "height": HEIGHT
    }
}

def get_config(mode):
    try:
        return CONFIG[mode]
    except:
        raise KeyError("invalid mode") 

def get_scene_list(root):
    # return sorted(os.listdir(root))
    return list(filter(lambda x: int(x.split("_")[0][5:]) > 706, sorted(os.listdir(root))))

def get_image_list(root):
    return sorted(os.listdir(root))

def reduce_size(input_path, output_path, width=WIDTH, height=HEIGHT):
    img = Image.open(input_path).resize((width, height))
    img.save(output_path)

def reduce_frame(mode):
    print("processing {}...".format(mode))
    config = get_config(mode)
    scene_list = get_scene_list(config["input_root"])
    for i, scene_id in enumerate(scene_list):
        # if os.path.exists(os.path.join(OUTPUT_FRAME_ROOT.format(scene_id))) or \
        #     os.path.exists(os.path.join(OUTPUT_PROJECTION_ROOT.format(scene_id))): 
        #     print("skipping {}...".format(scene_id))
        #     continue

        start = time.time()
        os.makedirs(config["output_root"].format(scene_id), exist_ok=True)
        image_list = get_image_list(config["input_sub_root"].format(scene_id))
        print("resizing images in {}...".format(scene_id))
        for image_file in tqdm(image_list):
            reduce_size(config["input_path"].format(scene_id, image_file), config["output_path"].format(scene_id, image_file))

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

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["frame", "projection"])
    args = parser.parse_args()

    # reduce
    reduce_frame(args.mode)