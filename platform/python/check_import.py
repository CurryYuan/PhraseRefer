import json 
import os
from types import prepare_class
from pymongo import MongoClient

def build_client():
    client = MongoClient('mongodb://0.0.0.0:27017/')
    db = client['mesh2cap']

    #这里根据需要的导出的数据集合名称进行选择，
    dataset = {'scanrefer': 's_phrasegrounding', 'nr3d': 'phrasegrounding', 'scannet':'MeshSelect'}

    for key, value in dataset.items():
        collection = db[dataset[key]]

        data = collection.find({}).count()

        if not data:
            print('导入数据过程中出错！')
        
        else:
            print('已经在 ' + key + ' 集合中成功导入数据 ' + str(data) + ' 条！')


if __name__ == '__main__':
    build_client()

