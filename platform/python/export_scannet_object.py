import os
import json
import time
import argparse
import numpy as np
from plyfile import PlyData, PlyElement
from utils import get_eta

# INPUT_ROOT = "/mnt/canis/Datasets/ScanNet/public/v2/scans/"
INPUT_ROOT = "/data/dataset/scannet/scans/"
OUTPUT_ROOT = "/home/ANONYMOUS/ScanRefer/ScanNet_objects"
OBJECT_PLY = os.path.join(OUTPUT_ROOT, "{}/{}.ply")
SCENE_PLY = os.path.join(INPUT_ROOT, "{}/{}_vh_clean_2.ply")
AGGR_JSON = os.path.join(INPUT_ROOT, "{}/{}_vh_clean.aggregation.json")
SEG_JSON = os.path.join(INPUT_ROOT, "{}/{}_vh_clean_2.0.010000.segs.json")
# INPUT_ROOT = "/mnt/canis/Datasets/ScanNet/public/v2/scans/"
# OUTPUT_ROOT = "/mnt/raid/davech2y/ScanNet_objects"
# OBJECT_PLY = os.path.join(OUTPUT_ROOT, "{}/{}.ply")
# SCENE_PLY = os.path.join(INPUT_ROOT, "{}/{}_vh_clean.ply")
# AGGR_JSON = os.path.join(INPUT_ROOT, "{}/{}_vh_clean.aggregation.json")
# SEG_JSON = os.path.join(INPUT_ROOT, "{}/{}_vh_clean.segs.json")

class ScanNetObject():
    def __init__(self, args, path_to_mesh, path_to_aggr, path_to_seg):
        # IO
        try:
            print("loading mesh PLY file...")
            self.mesh_ply = PlyData.read(path_to_mesh)
        except:
            raise Exception("the PLY file cannot be loaded")
        
        with open(path_to_aggr) as f:
            try:
                print("loading aggregation JSON file...")
                self.aggr_json = json.load(f)
            except:
                raise Exception("the aggregation JSON file cannot be loaded")

        with open(path_to_seg) as f:
            try:
                print("loading segmentation JSON file...")
                self.seg_json = json.load(f)["segIndices"]
            except:
                raise Exception("the segmentation JSON file cannot be loaded")

        assert self.mesh_ply.elements[0].count == len(self.seg_json)

        # properties
        self.args = args
        self.num_vertex = self.mesh_ply.elements[0].count
        self.info = self._parse_info()
        self.num_instance = len(self.info["object2label"].keys())

    def _parse_info(self):
        print("parsing JSON data...")
        info = {
            "object2label": {},
            "seg2object": {},
            "point2object": {},
            "object2point": {}
        }
        for item in self.aggr_json["segGroups"]:
            instance_id = item["id"]
            instance_seg = item["segments"]
            instance_label = item["label"]
            info["object2label"][instance_id] = instance_label
            for seg in instance_seg:
                info["seg2object"][seg] = instance_id

        for point in range(len(self.seg_json)):
            try:
                info["point2object"][point] = info["seg2object"][self.seg_json[point]]
            except KeyError:
                pass

        for key, value in info["point2object"].items():
            if value in info["object2point"].keys():
                info["object2point"][value].append(key)
            else:
                info["object2point"][value] = [key]

        return info

    def _extract_vertex(self, object_id):
        vertex = []
        oldpoint2newpoint = {}
        for new_id, point_id in enumerate(self.info["object2point"][object_id]):
            vertex.append(
                (
                    self.mesh_ply["vertex"]["x"][point_id],
                    self.mesh_ply["vertex"]["y"][point_id],
                    self.mesh_ply["vertex"]["z"][point_id],
                    self.mesh_ply["vertex"]["red"][point_id],
                    self.mesh_ply["vertex"]["green"][point_id],
                    self.mesh_ply["vertex"]["blue"][point_id],
                    self.mesh_ply["vertex"]["alpha"][point_id]
                )
            )
            oldpoint2newpoint[point_id] = new_id
        
        vertex = np.array(
            vertex, 
            dtype=[
                ("x", np.dtype("float32")), 
                ("y", np.dtype("float32")), 
                ("z", np.dtype("float32")),
                ("red", np.dtype("uint8")),
                ("green", np.dtype("uint8")),
                ("blue", np.dtype("uint8")),
                ("alpha", np.dtype("uint8"))
            ]
        )

        return PlyElement.describe(vertex, "vertex"), oldpoint2newpoint

    def _extract_face(self, object_id, oldpoint2newpoint):
        face = []
        for triangle in self.mesh_ply["face"]["vertex_indices"]:
            if triangle[0] in oldpoint2newpoint.keys() and triangle[1] in oldpoint2newpoint.keys() and triangle[2] in oldpoint2newpoint.keys():
                face.append(
                    (
                        np.array([
                            oldpoint2newpoint[triangle[0]],
                            oldpoint2newpoint[triangle[1]],
                            oldpoint2newpoint[triangle[2]]
                        ], dtype=np.dtype("int32")), 
                    )
                )
        
        face = np.array(
            face,
            dtype=[("vertex_indices", np.dtype("object"))]
        )

        return PlyElement.describe(face, "face")

    def extract_object_collection(self):
        print("extracting ScanNet objects...")
        object_collection = {}
        for object_id in self.info["object2point"].keys():
            vertex, oldpoint2newpoint = self._extract_vertex(object_id)
            face = self._extract_face(object_id, oldpoint2newpoint)
            object_collection[object_id] = PlyData([vertex, face])
        
        return object_collection

    def export_object_collection(self, object_collection):
        print("exporting ScanNet objects...")
        os.makedirs(os.path.join(OUTPUT_ROOT, args.scene_id), exist_ok=True)
        for object_id, object_ in object_collection.items():
            object_.write(OBJECT_PLY.format(args.scene_id, "_".join([str(object_id)]+self.info["object2label"][object_id].split(" "))))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--scene_id", required=True, type=str, help="ScanNet scene_id")
    args = parser.parse_args()

    scannet_object = ScanNetObject(
        args,
        SCENE_PLY.format(args.scene_id, args.scene_id), 
        AGGR_JSON.format(args.scene_id, args.scene_id), 
        SEG_JSON.format(args.scene_id, args.scene_id)
    )
    object_collection = scannet_object.extract_object_collection()
    scannet_object.export_object_collection(object_collection)

