import os
import json
import argparse


def hash_str_to_int(string):
    return hash(string)

if __name__ == "__main__":
    for split in ["train", "val", "test"]:
        MESH2CAP = json.load(open("server/backup/ScanRefer_raw_{}.json".format(split)))

        count = {
            "total": 0,
            "valid": 0,
            "unique": 0,
            "ambiguous": 0
        }
        for data in MESH2CAP:
            object_id = data["object_id"]
            selected_in_scene = data["verify"]["selected_in_scene"]
            selected_in_view = data["verify"]["selected_in_view"]
            
            count["total"] += 1
            if object_id in selected_in_scene: 
                count["valid"] += 1

                if len(selected_in_scene.split(" ")) == 1: 
                    count["unique"] += 1
                else:
                    count["ambiguous"] += 1
            
        print("split: {}".format(split))
        for key, value in count.items():
            print(key, value)
        
        print()
