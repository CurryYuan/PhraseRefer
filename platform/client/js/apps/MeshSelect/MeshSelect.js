import React from 'react';
import ReactDOM from 'react-dom';
import RootUI from './view/RootUI';
import ViewUI from "./view/ViewUI";
import WindowManager from "../Common/WindowManager"
import Stats from "../../lib/utils/stats.min.js";
import * as utils from "../Common/utils";
import * as nyuv2 from "../Common/NYUv2_colors";
import * as THREE from 'three/build/three';
import * as path from "path";
import { promisify } from 'util';
import { PlaneHelper } from 'three';
import { resolve } from 'dns';
import { rejects } from 'assert';

window.THREE = THREE;

class MeshSelect {

	init(params) {
		this.draw_div();

		// setup resources
		this.get_resource(params);

		// setup container
		this.label_container = document.getElementById("label_container");

		// setup button
		this.btn = new Object();
		this.btn.none = document.getElementById("btn_none");
		this.btn.surface = document.getElementById("btn_surface");
		this.btn.instance = document.getElementById("btn_instance");
		this.add_listener(this.btn.none, "click", this.on_click_btn_none);
		this.add_listener(this.btn.surface, "click", this.on_click_btn_surface);
		this.add_listener(this.btn.instance, "click", this.on_click_btn_instance);
		this.add_listener(document, "keydown", this.on_keydown_keyc);

		// setup window mesh
		this.window_mesh = new WindowManager("canvas_container", "canvas");
		this.window_mesh.init();
		this.attach_listener();

		// setup scene
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0xffffff );

		// renderer
		this.context = this.window_mesh.canvas.getContext("webgl2");
		this.renderer = new THREE.WebGLRenderer( { canvas: this.window_mesh.canvas, context: this.context } );
		this.renderer.setSize( this.window_mesh.window_width, this.window_mesh.window_height );

		// raycaster
		this.raycaster = new THREE.Raycaster();
		this.intersected = null;

		// primary promises for loading meshes
		let promises = [
			window.load_ply_file(path.join("/apps/resource/mesh/", this.resources.scene_id, this.resources.scene_mesh)),
			window.load_ply_file("/apps/resource/camera")
		];
		for (let i = 0; i < this.resources.scene_object.length; i++) {
			promises.push(
				window.load_ply_file(path.join("/apps/resource/object/", this.resources.scene_id, this.resources.scene_object[i]))
			)
		}
		this.set_loading_bar("20%", "loading resources...")
		Promise.all(promises).then(values => {
			// unpack data 
			this.scene_geometry = values[0];
			this.scene_geometry.computeVertexNormals();
			this.scene_geometry.computeBoundingSphere();
			this.scene_geometry_center = this.get_object_center(this.scene_geometry);
			this.camera_geometry = values[1];
			this.camera_geometry.computeVertexNormals();
			this.object_geometry = new Array();
			for (let i = 0; i < this.resources.scene_object.length; i++) {
				this.object_geometry.push(values[i+2]);
				this.object_geometry[i].name = this.resources.scene_object_name[i];
				this.object_geometry[i].computeVertexNormals();
			}
			this.set_loading_bar("35%", "parsing resources...")

			// Lights
			this.add_mesh(this.scene, [new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6)]);
			this.add_mesh(this.scene, [this.window_mesh.camera]);
			this.add_mesh(this.window_mesh.camera, [new THREE.PointLight(0xffffff, 0.5)]);

			// setup scene background mesh
			this.scene_mesh = this.set_mesh(
				this.scene_geometry,
				new THREE.MeshStandardMaterial({vertexColors: THREE.VertexColors, metalness: 0.0})
			);
			this.add_mesh(this.scene, [this.scene_mesh]);
			
			// indexing the mesh view
			// {0: instance, 1: surface}
			this.mesh_view = 1;
			this.instance_id = -1;

			// setup the vitual camera
			this.camera_flag = false;

			// setup object meshs
			this.object_mesh = new Array();
			for (let i = 0; i < this.object_geometry.length; i++) {
				this.object_mesh.push(this.set_mesh(
						this.object_geometry[i],
						new THREE.MeshStandardMaterial({vertexColors: THREE.VertexColors, metalness: 0.0})
				));
				this.object_mesh[i].name = this.resources.scene_object_name[i];
			}
			this.add_mesh(this.scene, this.object_mesh);
			this.set_loading_bar("75%", "loading frames...")

			// secondary promises for loading another resources
			let new_promises = [
				window.xhr_json("GET", path.join("/apps/resource/pose/", this.resources.scene_id)),
				window.xhr_json("GET", path.join("/apps/database/meshselect/query/", this.resources.scene_id))
			];
			Promise.all(new_promises).then(new_values => {
				// unpack data
				this.poses = this.parse_pose(new_values[0]);
				// randomly pick every 10 frames
				this.interval = 10;
				this.indices = this.get_frame_indices();
				// selected objects
				this.selected = this.init_selected(new_values[1]);
				this.render_label_list();

				// // axis
				// this.axis = new THREE.AxisHelper();
				// this.scene.add(this.axis);

				this.set_loading_bar("100%", "complete!")
				document.getElementById("loading_container").style.display = "none";
				document.getElementById("image_container").style.display = "block";
				document.getElementById("button_container").style.display = "block";

				// start rendering
				console.log(this.scene);
				this.init_camera();
				this.create_stats();
				this.render();
			});
		});

	}

	init_camera() {
		let radius = this.scene_geometry.boundingSphere.radius + 2;
		let init_pos = new THREE.Vector3(0, -radius, radius);
		let lookat = new THREE.Vector3(0, 0, 0);
		let up = new THREE.Vector3(0, 0, 1);
		this.window_mesh.set_view(init_pos, up, lookat);
	}

	/********************************************
     *************     renderers    *************
     ********************************************/	

	render() {
		this.stats.begin();
		// set current camera
		// this.add_mesh(this.window_mesh.camera, [this.camera_light]);
		let closest_pose = this.get_closest_pose();
		let nav_vector = new THREE.Vector3();
		this.window_mesh.camera.getWorldDirection(nav_vector);
		// highlight the intersected object
		this.get_intersection();
		// render
		this.render_frame(closest_pose);
		this.renderer.render( this.scene, this.window_mesh.camera );
		this.window_mesh.advance(0, 8);
		this.stats.end();
		requestAnimationFrame(this.render.bind(this));
	}

	render_frame(pose) {
		// show frame
		let img_url = path.join("/apps/resource/frame/", this.resources.scene_id, pose.index + ".jpg");
		document.getElementById("image").src = img_url;
		// show vitual camera
		if (this.camera_flag) {
			// this.scene.remove(this.camera_mesh);
			this.remove_mesh(this.scene, [this.camera_mesh]);
		}
		
		this.camera_mesh = new THREE.Mesh(this.camera_geometry, new THREE.MeshStandardMaterial( { color: 0x666666 } ));
		this.camera_mesh.applyMatrix(pose.pose);
		this.camera_mesh.scale.set(0.4, 0.4, 0.4);
		this.camera_mesh.position.x -= this.scene_geometry_center.x;
		this.camera_mesh.position.y -= this.scene_geometry_center.y;
		this.camera_mesh.position.z -= this.scene_geometry_center.z;
		// this.scene.add(this.camera_mesh);
		this.add_mesh(this.scene, [this.camera_mesh]);
		this.camera_flag = true;
	}

	render_label_list() {
		if (this.label_container.childNodes) this.label_container.innerHTML = null;
		let selected_ids = Object.keys(this.selected);
		for (let i = 0 ; i < selected_ids.length; i++) {
			utils.add_instance_label(document, this.label_container, this.resources.palette, this.selected[selected_ids[i]], selected_ids[i], selected_ids[i]);
			let cur_id = "label_"+this.selected[selected_ids[i]].split(" ").join("_")+"_"+selected_ids[i];
			let cur_label = document.getElementById(cur_id);
			this.add_listener(cur_label, "mouseup", this.on_click_label, cur_id);
			this.add_listener(cur_label, "mouseover", this.on_mouseover_label, cur_id);
		}
	}

	render_mesh_none() {
		this.scene_mesh.material = new THREE.MeshStandardMaterial( { color: 0xbcbcbc, metalness: 0.0 } );
		for (let i = 0; i < this.object_mesh.length; i++) {
			this.object_mesh[i].material = new THREE.MeshStandardMaterial( { color: 0xbcbcbc, metalness: 0.0 } );
		}
	}

	render_mesh_surface() {
		this.scene_mesh.material = new THREE.MeshStandardMaterial( { vertexColors: THREE.VertexColors, metalness: 0.0 } );
		for (let i = 0; i < this.object_mesh.length; i++) {
			this.object_mesh[i].material = new THREE.MeshStandardMaterial( { vertexColors: THREE.VertexColors, metalness: 0.0 } );
		}
	}

	render_mesh_selected() {
		this.scene_mesh.material = new THREE.MeshStandardMaterial( { color: 0xbcbcbc, metalness: 0.0 } );
		for (let i = 0; i < this.object_mesh.length; i++) {
			if (this.selected[i]) {
				let color = "rgb({0}, {1}, {2})".format(this.resources.palette[i][0], this.resources.palette[i][1], this.resources.palette[i][2]);
				this.object_mesh[i].material = new THREE.MeshStandardMaterial( { color: color, metalness: 0.0 } );
			}
			else {
				this.object_mesh[i].material = new THREE.MeshStandardMaterial( { color: 0xbcbcbc, metalness: 0.0 } );
			}
		}
	}

	/********************************************
     *************       Utils      *************
     ********************************************/

	get_resource(params) {
		this.resources = new Object();
		this.resources.root = params.scannet;
		this.resources.scene_id = params.scene_id;
		this.resources.scene_object = params.scene_object;
		this.resources.scene_object_name = this.get_scene_object_name();
		this.resources.scene_frame = params.scene_frame;
		this.resources.scene_list = params.scene_list;
		this.resources.scene_mesh = this.resources.scene_id + "_vh_clean_2.ply";
		this.resources.frames = "color";
		this.resources.poses = "pose";
		this.resources.palette = this.get_instance_palette();
	}

	get_scene_object_name() {
		let scene_object_name = new Array();
		for (let i = 0; i < this.resources.scene_object.length; i++) {
			scene_object_name.push(this.resources.scene_object[i].split(".")[0].split("_").slice(1).join(" "))
		}

		return scene_object_name;
	}

	get_instance_palette() {
		let palette = nyuv2.create_palette();
		let instance_palette = new Array();
		for (let i = 0; i < this.resources.scene_object.length; i++) {
			instance_palette.push(palette[i%palette.length]);
		}

		return instance_palette;
	}

	get_frame_indices() {
		let new_indices = [];
		let cur_index = 0;
		let frame_ids = Object.keys(this.poses);
		while (true) {
			if (cur_index >= frame_ids.length) {
				break;
			}
			else {
				new_indices.push(frame_ids[cur_index]);
				cur_index += this.interval;
			}
		}
		return new_indices;
	}

	get_closest_pose() {
		// decode the current camera rotation vector	
		let cur_rotation_vector = new THREE.Vector3();
		this.window_mesh.camera.getWorldDirection(cur_rotation_vector);
		// get the closest camera pose
		let closest_pose = new Object();
		closest_pose.index = 0;
		closest_pose.angle = Infinity;
		closest_pose.pose = this.poses[0];
		for (let i = 0; i < this.indices.length; i++) {
			// decode the frame camera rotation vector
			let pose_rotation = new THREE.Matrix4()
			pose_rotation.extractRotation(this.poses[this.indices[i]])
			let pose_rotation_vector = (new THREE.Vector3(0, 0, 1)).applyMatrix4(pose_rotation)
			let rotation_angle = (pose_rotation_vector).angleTo(cur_rotation_vector);

			if (rotation_angle < closest_pose.angle) {
				closest_pose.angle = rotation_angle;
				closest_pose.index = this.indices[i];
				closest_pose.pose = this.poses[this.indices[i]];
			}
		}
		return closest_pose;
	}

	get_object_center(geometry) {
		return geometry.boundingSphere.center;
	}

	get_intersection() {
		if (this.window_mesh.is_mouse_in_model_panel()) {
			this.raycaster.setFromCamera(this.window_mesh.pos_mouse, this.window_mesh.camera);
			let intersected = this.raycaster.intersectObjects(this.scene.children.slice(3));
			if (intersected.length > 0) {
				if (this.intersected != intersected[0].object) {
					if (this.intersected) this.intersected.material.emissive.setHex(this.intersected.currentHex);
					this.intersected = intersected[0].object;
					this.intersected.currentHex = this.intersected.material.emissive.getHex();
					this.intersected.material.emissive.setHex(0x0059ff);
					this.instance_id = this.scene.children.slice(3).indexOf(this.intersected);
					if (this.instance_id > 0 && this.instance_id < this.resources.scene_object.length) {
						this.intersected_name = this.resources.scene_object[this.instance_id].split(".")[0];
					}
				}
			} 
			else {
				if (this.intersected) this.intersected.material.emissive.setHex(this.intersected.currentHex);
				this.intersected = null;
				this.instance_id = -1;
			}
		}
	}

	set_loading_bar(progress, status) {
		let loading_bar = document.getElementById("loading_bar");
		let loading_status = document.getElementById("loading_status");
		loading_bar.style.width = progress;
		loading_status.innerHTML = status;
	}

	set_mesh(geometry, material) {
		let mesh = new THREE.Mesh(geometry, material);
		mesh.position.x = -this.scene_geometry_center.x;
		mesh.position.y = -this.scene_geometry_center.y;
		mesh.position.z = -this.scene_geometry_center.z;

		return mesh
	}

	init_selected(db_results) {
		let data = db_results.data;
		let selected = new Object();
		if (data.length > 0) {
			for (let i = 0; i < data.length; i++) {
				selected[parseInt(data[i].object_id)] = data[i].object_name;
			}
		}

		return selected;
	}

	update_selected() {
		return new Promise((resolve, reject) => {
			let intersected_id = parseInt(this.intersected_name.split("_")[0]);
			let intersected_name = this.intersected_name.split("_").slice(1).join(" ");
			if (!this.selected[intersected_id]) {
				this.selected[intersected_id] = intersected_name;
				let record = new Object();
				record.scene_id = this.resources.scene_id;
				record.object_id = intersected_id.toString();
				record.object_name = intersected_name;
				resolve(window.xhr_post(JSON.stringify(record), path.join("/apps/database/meshselect/save")));
			}
		});
	}

	delete_selected(selected_id) {
		delete this.selected[selected_id];
	}

	add_mesh(container, mesh_list) {
		for (let i = 0; i < mesh_list.length; i++) {
			container.add(mesh_list[i]);
		}
	}

	remove_mesh(container, mesh_list) {
		for (let i = 0; i < mesh_list.length; i++) {
			container.remove(mesh_list[i]);
		}
	}

	parse_pose(pose_object) {
		let parsed = new Object();
		let pose_ids = Object.keys(pose_object);
		for (let i = 0; i < pose_ids.length; i++) {
			let pose_id = parseInt(pose_ids[i]);
			let pose = new THREE.Matrix4();
			pose.fromArray(pose_object[pose_ids[i]]);
			pose.transpose();
			parsed[pose_id] = pose
		}

		return parsed;
	}

	/********************************************
     *************  Event handlers  *************
     ********************************************/

	on_click_btn_none() {
		console.log("show the mesh geometry");
		this.render_mesh_none();
	}

	on_click_btn_surface() {
		console.log("show the mesh surface, current selected instance: "+this.instance_id);
		this.mesh_view = 1;
		this.render_mesh_surface()
	}

	on_click_btn_instance() {
		console.log("show the instance surface, current selected instance: "+this.instance_id);
		this.mesh_view = 0;
		this.render_mesh_selected()
	}

	on_click_label(id) {
		return function() {			
			// parse instance id
			let label_element = id.split("_");
			let instance_id = label_element[label_element.length - 1];
			let instnace_name = label_element.slice(1, -1).join(" ");
			this.instance_id = instance_id;
			console.log("select instance: {0} {1}".format(instance_id, instnace_name));

			if (event.which == 1) {
				let answer = confirm("Do you want to delete this selected object?");
				if (answer) {
					window.xhr("GET", path.join("/apps/database/meshselect/delete", this.resources.scene_id, instance_id.toString())).then(() => {
						this.delete_selected(parseInt(instance_id));
						this.render_label_list();
						this.render_mesh_selected();
					});
				}
			}
		}.bind(this);
	}

	on_keydown_keyc(event) {
		if (event.keyCode === 67) {
			this.mesh_view = (this.mesh_view + 1) % 2;
			if (this.mesh_view % 2) {
				this.scene_mesh.material = new THREE.MeshStandardMaterial( { vertexColors: THREE.VertexColors, metalness: 0.0 } );
				for (let i = 0; i < this.object_mesh.length; i++) {
					this.object_mesh[i].material = new THREE.MeshStandardMaterial( { vertexColors: THREE.VertexColors, metalness: 0.0 } );
				}
			}
			else {
				this.scene_mesh.material = new THREE.MeshStandardMaterial( { color: 0xbcbcbc, metalness: 0.0 } );
				for (let i = 0; i < this.object_mesh.length; i++) {
					if (this.selected[i]) {
						let color = "rgb({0}, {1}, {2})".format(this.resources.palette[i][0], this.resources.palette[i][1], this.resources.palette[i][2]);
						this.object_mesh[i].material = new THREE.MeshStandardMaterial( { color: color, metalness: 0.0 } );
					}
					else {
						this.object_mesh[i].material = new THREE.MeshStandardMaterial( { color: 0xbcbcbc, metalness: 0.0 } );
					}
				}
			}
		}
	}

	on_mouseover_label(id) {
		return function() {			
			// remove the old mesh
			this.scene.remove(this.mesh);

			// parse instance id
			if (id == "label_ALL") {
				this.instance_id = -1;
				if (this.intersected) {
					this.intersected.material.emissive.setHex(this.intersected.currentHex);
				}
			}
			else {
				this.instance_id = id.split("_").slice(-1)[0];
				if (this.intersected) {
					this.intersected.material.emissive.setHex(this.intersected.currentHex);
				}
				this.intersected = this.scene.children.slice(3)[this.instance_id];
				this.intersected.currentHex = this.intersected.material.emissive.getHex();
				this.intersected.material.emissive.setHex(0x0059ff);
			}

		}.bind(this);
	}

	mouseclick(event) {}

    mousedown(event) {
		if (this.window_mesh.is_mouse_in_model_panel()) {
			if (event.which == 1) {
				let intersected = this.raycaster.intersectObjects(this.scene.children.slice(3));
				if (intersected.length > 0) {
					this.update_selected().then(() => this.render_label_list());
					if (this.mesh_view == 0) this.render_mesh_selected();
				}
			}
			this.window_mesh.mousedown(event);
		}
    }

    mouseup(event) {
		if (this.window_mesh.is_mouse_in_model_panel()) {
			this.window_mesh.mouseup(event);
		}
    }

    mousemove(event) {
		if (this.window_mesh.is_mouse_in_model_panel()) {
			this.window_mesh.mousemove(event);
		}
    }

    mousewheel(event) {
        this.window_mesh.navigation.mousewheel(event);
	}
	
	mouseenter(event) {
		this.window_mesh.mouseenter(event);
	}

	mouseleave(event) {
		this.window_mesh.mouseleave(event);
	}

    contextmenu(event) {
        this.window_mesh.navigation.contextmenu(event);
    }

    attach_listener() {
        // -> event listeners
		this.window_mesh.add_listener('contextmenu', this.contextmenu.bind(this));
        this.window_mesh.add_listener('click', this.mouseclick.bind(this));
        this.window_mesh.add_listener('mousemove', this.mousemove.bind(this));
        this.window_mesh.add_listener('mousedown', this.mousedown.bind(this));
        this.window_mesh.add_listener('mouseup', this.mouseup.bind(this));
		this.window_mesh.add_listener('mousewheel', this.mousewheel.bind(this));
		this.window_mesh.add_listener('mouseenter', this.mouseenter.bind(this));
		this.window_mesh.add_listener('mouseleave', this.mouseleave.bind(this));
        // <-
	}

	add_listener(element, event, callback, argument=null) {
        this[callback.name+"_ref"] = callback.bind(this);
        if (argument) {
            element.addEventListener(event, this[callback.name+"_ref"](argument));
        }
        else {
            element.addEventListener(event, this[callback.name+"_ref"]);
        }
    }

	create_stats() {
		this.stats = new Stats();
		this.stats.domElement.style.position = "absolute";
		this.stats.domElement.style.left = document.getElementById("canvas_container").style.marginLeft;
		document.getElementById("canvas_container").appendChild(this.stats.dom);
	}

	draw_div() {
		ReactDOM.render(<RootUI/>, document.getElementById('id_div_root'));
	}

}

window.MeshSelect = MeshSelect;
