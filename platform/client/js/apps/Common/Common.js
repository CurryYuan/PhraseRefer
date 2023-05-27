let MTLLoader = require("../../lib/loader/MTLLoader");
let OBJLoader = require("../../lib/loader/OBJLoader");
let PLYLoader = require("../../lib/loader/PLYLoader");

import * as THREE_LIB from 'three/build/three';

window.THREE = THREE;

window.xhr_json = function (type, url) {
    return new Promise((resolve, reject) => {
        let xhr0 = new XMLHttpRequest();
        xhr0.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                let res = JSON.parse(this.response);
                resolve(res);
            }
        };
        xhr0.open(type, url, true);
        xhr0.send();
    });
};

window.xhr = function (type, url) {
    return new Promise((resolve, reject) => {
        let xhr0 = new XMLHttpRequest();
        xhr0.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                resolve(this.response);
            }
        };
        xhr0.open(type, url, true);
        xhr0.send();
    });
};

window.xhr_post = function (data, url) {
    return new Promise((resolve, reject) => {
        let xhr0 = new XMLHttpRequest();
        xhr0.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                resolve(this.response);
            }
        };
        xhr0.open('POST', url, true);
        xhr0.setRequestHeader("Content-Type", "application/json");
        xhr0.send(data);
    });  
}

window.xhr_arraybuffer = function (type, url) {
    return new Promise((resolve, reject) => {
        let xhr0 = new XMLHttpRequest();
        xhr0.responseType = "arraybuffer";
        xhr0.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                resolve(this.response);
            }
        };
        xhr0.open(type, url, true);
        xhr0.send();
    });
};

window.xhr_push = function (type, url, data) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(type, url);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                let res = JSON.parse(this.response);
                resolve(res);
            }
        };
        xhr.send(JSON.stringify(data));
    });
};

window.xhr_goto_url = function (type, url) {
    let xhr0 = new XMLHttpRequest();
    xhr0.onload = function() {
        document.body.innerHTML = this.response;
    }
    xhr0.responseType = "document";
    xhr0.open(type, url);
    xhr0.send();
};

window.load_obj_file = function (base_path, obj_file, mtl_file) {
    return new Promise(function (resolve, reject){
        var mtl_loader = new THREE.MTLLoader();
        mtl_loader.setPath(base_path);  
        mtl_loader.load(mtl_file, function(materials) {
            materials.preload();  
            check_if_materials_loaded(materials.materials).then(function(){
                var obj_loader = new THREE.OBJLoader();
                obj_loader.setOptions({keepVertIndices: true})
                obj_loader.setMaterials(materials);
                obj_loader.setPath(base_path);
                obj_loader.load(obj_file, function (object) {
                    resolve(object.children[0]);
                });
            });        
        });
    });
};

window.load_ply_file = function (ply_path) {
    return new Promise(function (resolve, reject) {
        var loader = new THREE.PLYLoader();
        loader.load(ply_path, function(geometry){
            resolve(geometry);
        });
    });
}

window.resolve_if_property_true = function(object, property, resolve) {
    if (object[property] == true) {
        resolve();
    }
    else {
        window.setTimeout(function() {
            resolve_if_property_true(object, property, resolve);
        }, 250);
    }
}

window.create_promise_for_property = function(object, property) {
    return new Promise(function(resolve, reject) {
        resolve_if_property_true(object, property, resolve); 
    });
}

function check_if_materials_loaded(materials) {
    function resolve_if_material_loaded(material_map, resolve) {
        if (material_map.image != null && material_map.image.complete) {
            resolve();
        }
        else{
            window.setTimeout(function(){
                resolve_if_material_loaded(material_map, resolve);
            }, 100);
        }
    }
    function promise_for_loaded_map(material_map) {
        return new Promise(function (resolve, reject){
            resolve_if_material_loaded(material_map, resolve);
        });
    }
    let all_promises = [];
    for (var key in materials) {
        if (materials[key].map != null) {
            all_promises.push(promise_for_loaded_map(materials[key].map));
        }
    }
    return new Promise(function (resolve, reject){
        Promise.all(all_promises).then(function() {
            return resolve();
        });
    })
}

window.load_matrix = function(path_to_mat) {
    return xhr("GET", path_to_mat).then(txt => {
        let entries = [];
        let lines = txt.split("\n");
        for (let idx = 0; idx < 4; idx++){
            entries.push(...lines[idx].trim().split(" ").map(x => parseFloat(x)))
        }
        let matrix = new THREE.Matrix4();
        matrix.fromArray(entries);
        matrix.transpose();
        return matrix;
    });
}

window.load_matrices = function(path_to_mats, num_mats) {
    return xhr("GET", path_to_mats).then(txt => {
        let matrices = [];
        let lines = txt.split("\n");
        for(let i = 0; i < num_mats; i++) {
            let entries = [];
            for (let idx = 0; idx < 4; idx++){
                entries.push(...lines[i*4 + idx].trim().split(" ").map(x => parseFloat(x)))
            }
            let matrix = new THREE.Matrix4();
            matrix.fromArray(entries);
            matrix.transpose();
            matrices.push(matrix);
        }
        return matrices;
    });
}

class Pixel {
    constructor(x, y, cx, cy) {
        this.x = x;
        this.y = y;
        this.cx = cx;
        this.cy = cy;
    }
}

window.eventToPixel = function (rect, event, canvas_to_img_width_ratio=1.0, canvas_to_img_height_ratio=1.0) {
    return new Pixel(Math.round((event.clientX - rect.x) / canvas_to_img_width_ratio), Math.round((event.clientY - rect.y) / canvas_to_img_height_ratio), Math.round(event.clientX - rect.x), Math.round(event.clientY - rect.y));
}

if (!THREE.Vector4.prototype.toVector3) {
    THREE.Vector4.prototype.toVector3 = function() {
        let ret_val = new THREE.Vector3(this.x, this.y, this.z)
        ret_val.divideScalar(this.w);
        return ret_val;    
    }
}

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

if(!Array.prototype.clone) {
    Array.prototype.clone = function() {
        return this.slice(0);
    };    
}


window.getOffset = function( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}


window.isElementInViewport = function (el) {
    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.left <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
}

window.basename = function(str)
{
   var base = new String(str).substring(str.lastIndexOf('/') + 1); 
    if(base.lastIndexOf(".") != -1)       
        base = base.substring(0, base.lastIndexOf("."));
   return base;
}

window.getParameterByName = function(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

window.handleSessionLost = function (response) {
    if (response != "OK") {
      alert("Error occured - possible session lost");
      window.location.replace("login");
    }
}