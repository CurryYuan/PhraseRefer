import * as math from "mathjs";

export function add_instance_label(document, container, palette, name, count, text) {
    // wrapper
    let wrapper = document.createElement("label");
    container.appendChild(wrapper);
    let wrapper_name = name.split(" ").filter(Boolean);
    wrapper_name.push(count);
    wrapper.setAttribute("id", "label_"+wrapper_name.join("_"));
    wrapper.setAttribute("class", "btn btn-lg btn-light");

    
    wrapper.setAttribute("style", "text-align: left; width: 320px;");

    // color indicator
    let color_div = document.createElement("div");
    wrapper.appendChild(color_div);
    color_div.setAttribute(
        "style", 
        "background-color: rgb(" + palette[count%palette.length][0] + ", " + palette[count%palette.length][1] + ", " + palette[count%palette.length][2] + "); float: left; width: 50px; margin-right: 10px;"
    );
    color_div.setAttribute("id", "color_"+wrapper_name.join("_"));
    color_div.setAttribute("align", "center");
    // instance enumerator
    let color_text = document.createElement("span");
    color_div.appendChild(color_text);
    color_text.setAttribute("id", "color_idx_"+count);
    color_text.setAttribute("style", "color: white");
    color_text.innerHTML = text;

    // instance label
    let label_span = document.createElement("span");
    wrapper.appendChild(label_span);
    label_span.setAttribute("style", "float: left;")
    label_span.innerHTML = name;

}

export function parse_aggr_file(aggr_file) {
    let aggregation = new Object();
    aggregation.id2label = new Object();
    aggregation.seg2id = new Object();
    let segfile_name = aggr_file["segmentsFile"].split(".");
    if (segfile_name[0] == "scannet") {
        aggregation.segfile = segfile_name.slice(1).join(".");
    }
    else {
        aggregation.segfile = segfile_name.join(".");
    }
    
    for (let group_id = 0; group_id < aggr_file["segGroups"].length; group_id++) {
        let item = aggr_file["segGroups"][group_id];
        aggregation.id2label[item["id"]] = item["label"];
        for (let seg_id = 0; seg_id< item["segments"].length; seg_id++) {
            let seg = item["segments"][seg_id];
            aggregation.seg2id[seg] = item["id"];
        }
    }

    return aggregation;
}

export function apply_palette(id2label, palette) {
    let instance_pallete = [];
    for (let id = 0; id < Object.keys(id2label).length; id++) {
        let item = new Object();
        let colors = palette[id % palette.length];
        item.label = id2label[id];
        item.color = [
            colors[0],
            colors[1],
            colors[2]
        ];
        instance_pallete.push(item);
    }

    return instance_pallete;
}

export function get_object_collection(scene, instance2color) {
    let object_collection = new Array();
    let object_list = Object.keys(instance2color);
    for (let object_id = 0; object_id < object_list.length; object_id++) {
        // let object = scene.clone();
        let object = new THREE.BufferGeometry();
        let num_point = instance2color[object_id].length;
        let iter_map = {0:"color", 1:"normal", 2:"position"}
        let point_collection = new Array();
        for (let i = 0; i < 3; i++) {
            let attribute = new Float32Array(num_point * 3);
            for (let point_id = 0; point_id < num_point; point_id++) {
                attribute[point_id * 3] = scene.attributes[iter_map[i]].array[instance2color[object_id][point_id][0] * 3];
                attribute[point_id * 3 + 1] = scene.attributes[iter_map[i]].array[instance2color[object_id][point_id][0] * 3 + 1];
                attribute[point_id * 3 + 2] = scene.attributes[iter_map[i]].array[instance2color[object_id][point_id][0] * 3 + 2];
                if (i == 0) point_collection.push(instance2color[object_id][point_id][0]);
            }
            object.addAttribute(iter_map[i], new THREE.BufferAttribute(attribute, 3));
        }
        let indices = Array.from(scene.index.array).filter(x => point_collection.includes(x));
        object.index = new THREE.BufferAttribute(Uint32Array.from(indices), 1);
        object_collection.push(object);
    }

    return object_collection;
}

export function get_surface_colors(geometry, instance2color, instance_id, fade=false) {
    let original_colors = geometry.attributes.color.array;
    const rgb_len = 3;
    const default_rgb = 200 / 255; // light grey
    let num_point = geometry.attributes.color.count;
    let surface_colors;
    // mask out the unselected instances
    if (instance_id != -1) {
        if (fade) {
            let unit_array = new Float32Array(num_point * rgb_len)
            unit_array.fill(1)
            let fade_factor = 0.6;
            surface_colors = Float32Array.from(math.add(math.multiply(math.subtract(Array.from(unit_array), Array.from(original_colors)), fade_factor), Array.from(original_colors)));
        }
        else {
            surface_colors = new Float32Array(num_point * rgb_len);
            surface_colors.fill(default_rgb);
        }
        for (let color_id = 0; color_id < instance2color[instance_id].length; color_id++) {
            let point_id = instance2color[instance_id][color_id][0];
            for (let rgb_id = 0; rgb_id < rgb_len; rgb_id++) {
                surface_colors[rgb_len * point_id + rgb_id] = original_colors[rgb_len * point_id + rgb_id];
            }
        }
    }
    else {
        surface_colors = original_colors;
    }

    return surface_colors
}

export function get_instance2color(aggregation, segfile, palette) {
    let id2color = [];
    for (let id = 0; id < Object.keys(aggregation.id2label).length; id++) {
        id2color.push([]);
    }
    // console.log(aggregation);
    // console.log(segfile);
    for (let point_id = 0; point_id < segfile.length; point_id++) {
        let seg = segfile[point_id];
        try {
            let instance_id = aggregation.seg2id[seg];
            let color_id = instance_id % palette.length;
            let color = palette[color_id];
            id2color[instance_id].push(
                [
                    point_id,
                    color[0] / 255,
                    color[1] / 255,
                    color[2] / 255
                ]
            );
        }
        catch (error) {}
    }

    return id2color;
}

export function get_instance_colors(geometry, instance2color, instance_id) {
    const rgb_len = 3;
    const default_rgb = 200 / 255; // light grey
    let num_point = geometry.attributes.color.count;
    let instance_colors = new Float32Array(num_point * rgb_len);
    instance_colors.fill(default_rgb);
    if (instance_id == -1) {
        for (let instance = 0; instance < instance2color.length; instance++) {
            for (let color_id = 0; color_id < instance2color[instance].length; color_id++) {
                let point_id = instance2color[instance][color_id][0];
                let offset = 1;
                for (let rgb_id = 0; rgb_id < rgb_len; rgb_id++) {
                    instance_colors[rgb_len * point_id + rgb_id] = instance2color[instance][color_id][rgb_id + offset];
                }
            }
        }
    }
    else {
        for (let color_id = 0; color_id < instance2color[instance_id].length; color_id++) {
            let point_id = instance2color[instance_id][color_id][0];
            let offset = 1;
            for (let rgb_id = 0; rgb_id < rgb_len; rgb_id++) {
                instance_colors[rgb_len * point_id + rgb_id] = instance2color[instance_id][color_id][rgb_id + offset];
            }
        }
    }
    
    return instance_colors;
}

export function set_geometry_colors(geometry, colors) {
    geometry.attributes.color.array = colors;
    geometry.attributes.color.needsUpdate = true;

    return geometry;
}