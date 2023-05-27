import os
import json
import argparse


def hash_str_to_int(string):
    return hash(string)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=str, required=True)
    args = parser.parse_args()

    MESH2CAP = json.load(open(args.input))

    for split in ["train", "val", "test"]:
        with open("data/scannetv2_{}.txt".format(split), "r") as f:
            scan_list = [scene_id.strip() for scene_id in f.readlines()]

        mesh2cap_split = []

        for data in MESH2CAP:
            object_id = data["object_id"]
            selected_in_scene = data["verify"]["selected_in_scene"]
            selected_in_view = data["verify"]["selected_in_view"]

            if data["scene_id"] in scan_list:
                # rename anno_id to ann_id
                data["ann_id"] = data["anno_id"]
                data.pop("anno_id")

                if object_id in selected_in_scene:
                    mesh2cap_split.append(data)

        with open("server/backup/ScanRefer_raw_{}.json".format(split), "w") as f:
            json.dump(mesh2cap_split, f, indent=4)


        print("split: {}".format(split))
        
        scenes = list(set([data["scene_id"] for data in mesh2cap_split]))
        print("num_scenes: {}".format(len(scenes)))

        objects = list(set([hash_str_to_int(data["scene_id"] + data["object_id"]) for data in mesh2cap_split]))
        print("num_objects: {}".format(len(objects)))

        samples = list(set([hash_str_to_int(data["scene_id"] + data["object_id"] + data["ann_id"]) for data in mesh2cap_split]))
        print("num_samples: {}".format(len(samples)))
        print()
