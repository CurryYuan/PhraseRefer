import json 
import os
from pymongo import MongoClient

def build_client():
    client = MongoClient('mongodb://x.x.x.x:x/')
    db = client['mesh2cap']

    collection = db['phrasegrounding']

    data = collection.find()

    return data



def export_data(data, filename, filepath):
    processed_data = []
    for da in data:
        try:
            curr_data = {}
            curr_data['scene_id'] = da['scene_id']
            curr_data['object_id'] = da['object_id']
            curr_data['ann_id'] = da['ann_id']
            curr_data['description'] = da['description']
            curr_data['position_start'] = da['position'].split('_')[0]
            curr_data['position_end'] = da['position'].split('_')[1]
            curr_data['labeled_id'] = da['labeled_id']
            curr_data['labeled_phrase'] = da['labeled_phrase']

            processed_data.append(
                curr_data
            )
        except:
            print(da)
    
    with open(os.path.join(filepath, filename), 'w') as f:
        for pd in processed_data:
            f.write(json.dumps(pd)+'\n')

if __name__ == "__main__":
    filename = 'exported_data.json'
    filepath = ''

    data = build_client()
    export_data(data, filename, filepath)