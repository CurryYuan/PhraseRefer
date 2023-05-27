import os
import time
import subprocess
from utils import get_eta

PROJ_ROOT = "/home/davech2y/Mesh2Cap/"                                   # TODO change this
# INPUT_ROOT = os.path.join(PROJ_ROOT, "server/static/ScanNetV2/scans/")
# INPUT_DATA = os.path.join(INPUT_ROOT, "{}/{}_vh_clean_2.ply")
INPUT_ROOT = "/data/dataset/scannet/scans/"
INPUT_DATA = os.path.join(INPUT_ROOT, "{}/{}_vh_clean_2.ply")
OUTPUT_ROOT = "/mnt/raid/davech2y/ScanNet_previews/"               # TODO change this
SSTK_ROOT = "/home/davech2y/sstk/"
RENDER_TOOL = os.path.join(SSTK_ROOT, "ssc/render-file.js")
RENDER_CONFIG = os.path.join(PROJ_ROOT, "python/config/render_scan.json")
RENDER_WIDTH = 500
RENDER_HEIGHT = 500

def get_scene_list():
    return sorted(os.listdir(INPUT_ROOT))

def render(scene_id):
    cmd = [
        "node", RENDER_TOOL,
        "--input", INPUT_DATA.format(scene_id, scene_id),
        "--output_dir", OUTPUT_ROOT,
        "--width", str(RENDER_WIDTH),
        "--height", str(RENDER_HEIGHT),
        "--config_file", RENDER_CONFIG
    ]
    _ = subprocess.call(
        cmd,
        stderr=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL
    )
    # _ = subprocess.call(cmd)

if __name__ == "__main__":
    scene_list = get_scene_list()

    for i, scene_id in enumerate(scene_list):
        if os.path.exists(os.path.join(OUTPUT_ROOT, "{}_vh_clean_2.png".format(scene_id))): continue
        start = time.time()
        render(scene_id)
        num_left = len(scene_list) - i - 1
        eta = get_eta(start, time.time(), 0, num_left)
        print("rendered {}, {} left, ETA: {}h {}m {}s".format(
            scene_id,
            num_left,
            eta["h"],
            eta["m"],
            eta["s"]
        ))

    print("done!")