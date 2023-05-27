import React from 'react';
import ReactDOM from 'react-dom';
import RootUI from './view/RootUI';
import ViewUI from "./view/ViewUI";
import StartUI from './view/StartUI';
import EndUI from './view/EndUI';
import InstructionContent from './view/InstructionContent'
import ControlContent from './view/ControlContent'
import CommentContent from './view/CommentContent'
import WindowManager from "../Common/WindowManager"
import Stats from "../../lib/utils/stats.min.js";
import * as utils from "../Common/utils";
import * as nyuv2 from "../Common/NYUv2_colors";
import * as THREE from 'three/build/three';
import * as path from "path";

window.THREE = THREE;

class MeshVerify {

	init(params) {
		// setup resources
		this.get_resource(params);

		// init 	
		// this.init_start_ui();	
		this.init_root_ui()
	}

	// init_start_ui() {
	// 	if (this.resources.batch_id == "" || this.resources.page_id > 0) {
	// 		this.init_root_ui();
	// 	}
	// 	else {
	// 		// render instruction
	// 		ReactDOM.render(<StartUI />, document.getElementById('id_div_root'), function() {
	// 			let btn_start = document.getElementById('submit_start');
	// 			this.add_listener(btn_start, "click", this.on_click_start);
	// 			ReactDOM.render(<InstructionContent/>, document.getElementById("instruction_content"));
	// 		}.bind(this));
	// 	}
	// }

	init_root_ui() {
		// render page
		ReactDOM.render(<RootUI/>, document.getElementById('id_div_root'), function() {
			this.start = (new Date()).getTime();
			// flags
			this.cur_page_id = 0;

			// show helper
			document.getElementById('helper_container').style.display = "inline-block";
			ReactDOM.render(<InstructionContent/>, document.getElementById("instruction_content"));
			ReactDOM.render(<ControlContent/>, document.getElementById("control_content"));
			this.instruction = document.getElementById("instruction_container");
			this.control = document.getElementById("control_container");
			// show start
			let btn_start = document.getElementById('submit_start');
			this.add_listener(btn_start, "click", this.on_click_start);
			ReactDOM.render(<InstructionContent/>, document.getElementById("start_instruction_content"));
			ReactDOM.render(<ControlContent/>, document.getElementById("start_control_content"));
			
			// setup button
			this.btn = new Object();
			this.btn.instruction = document.getElementById("instruction_helper");
			this.btn.control = document.getElementById("control_helper");
			this.btn.close_instruction = document.getElementById("close_instruction");
			this.btn.close_control = document.getElementById("close_control");

			this.add_listener(this.btn.instruction, "click", this.on_click_btn_instruction);
			this.add_listener(this.btn.close_instruction, "click", this.on_click_close_instruction);
			this.add_listener(this.btn.control, "click", this.on_click_btn_control);
			this.add_listener(this.btn.close_control, "click", this.on_click_close_control);
			this.add_listener(document, "keydown", this.on_keydown_keyc);
			this.add_listener(document, "keydown", this.on_keydown_keyf);
			this.add_listener(document, "keydown", this.on_keydown_keyr);
			this.add_listener(document, "keydown", this.on_keydown_keyv);
			this.add_listener(document, "keydown", this.on_keydown_keys);

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
				// window.load_ply_file("/apps/resource/camera")
			];
			for (let i = 0; i < this.resources.scene_object.length; i++) {
				promises.push(
					window.load_ply_file(path.join("/apps/resource/object/", this.resources.scene_id, this.resources.scene_object[i]))
				)
			}
			this.set_loading_bar("20%", "loading resources...")
			Promise.all(promises).then(values => {
				this.message = "load mesh files";
				this.time = this.get_time_passed(this.start, (new Date()).getTime());
				this.send_time(this.message, this.time);
				this.start = (new Date()).getTime();

				// unpack data 
				this.scene_geometry = values[0];
				this.scene_geometry.computeVertexNormals();
				this.scene_geometry.computeBoundingSphere();
				this.scene_geometry_center = this.get_object_center(this.scene_geometry);
				// this.camera_geometry = values[1];
				// this.camera_geometry.computeVertexNormals();
				this.object_geometry = new Array();
				for (let i = 0; i < this.resources.scene_object.length; i++) {
					// this.object_geometry.push(values[i+2]);
					this.object_geometry.push(values[i+1]);
					this.object_geometry[i].name = this.resources.scene_object_id[i]+"_"+this.resources.scene_object_name[i];
					this.object_geometry[i].computeVertexNormals();
				}
				this.set_loading_bar("35%", "parsing resources...")
				// console.log(this.geometry);

				let new_promises = [
					window.xhr_json("GET", path.join("/apps/resource/pose/", this.resources.scene_id)),
					window.xhr_json("GET", path.join("/apps/resource/gallery/", this.resources.scene_id))
				];
				this.set_loading_bar("75%", "loading frames...")
				Promise.all(new_promises).then(new_values => {
					this.message = "load resources";
					this.time = this.get_time_passed(this.start, (new Date()).getTime());
					this.send_time(this.message, this.time);
					this.start = (new Date()).getTime();

					// unpack data
					// this.poses = new_values;
					this.poses = this.parse_pose(new_values[0]);
					this.object_gallery = new_values[1];
					// randomly pick every 10 frames
					this.interval = 10;
					this.indices = this.get_frame_indices();
					// preload frames
					this.preload_complete = false;
					this.preload_frame();

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
					this.mesh_view = 1;
					this.instance_id = -1;
					this.annotation_info = new Object();

					// setup the vitual camera
					this.camera_flag = false;

					// setup object meshs
					this.object_mesh = new Array();
					this.object_dict = new Object();
					this.object_hexs = new Object();
					for (let i = 0; i < this.object_geometry.length; i++) {
						this.object_mesh.push(this.set_mesh(
							this.object_geometry[i],
							new THREE.MeshStandardMaterial({vertexColors: THREE.VertexColors, metalness: 0.0})
						));
						this.object_mesh[i].name = this.resources.scene_object_id[i]+"_"+this.resources.scene_object_name[i];
						this.object_dict[this.resources.scene_object_id[i]] = this.object_mesh[i];
						this.object_hexs[this.resources.scene_object_id[i]] = this.object_mesh[i].material.emissive.getHex();
					}
					this.add_mesh(this.scene, this.object_mesh);
					this.set_loading_bar("100%", "complete!")

					// // axis
					// this.axis = new THREE.AxisHelper();
					// this.scene.add(this.axis);

					document.getElementById("loading_container").style.display = "none";
					document.getElementById("image_container").style.display = "block";
					document.getElementById("page_id").innerHTML = this.cur_page_id + 1;
					document.getElementById("batch_size").innerHTML = this.resources.batch_size;

					this.message = "set resources";
					this.time = this.get_time_passed(this.start, (new Date()).getTime());
					this.send_time(this.message, this.time);

					// start rendering
					// this.create_stats();
					this.init_camera();
					this.render_annotation_results();
					this.render();
				});
			});
		}.bind(this));
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
		// this.stats.begin();
		// set current camera
		let closest_pose = this.get_closest_pose();
		let nav_vector = new THREE.Vector3();
		this.window_mesh.camera.getWorldDirection(nav_vector);
		// highlight the intersected object
		this.get_intersection();
		// render
		if (this.preload_complete) this.render_frame(closest_pose);
		this.renderer.render(this.scene, this.window_mesh.camera);
		this.window_mesh.advance(0, 8);
		// this.stats.end();
		requestAnimationFrame(this.render.bind(this));
	}

	render_frame(pose) {
		document.getElementById("image").src = this.resources.preload_frames[pose.index].src;
	}

	render_annotation_results() {
		window.xhr_json("GET", path.join("/apps/database/mesh2cap/query", this.resources.scene_id, "-1", "-1")).then(results => {
			let status_map = {
				"unverified": "unverified",     // the description hasn't been verified yet
				"verified": "verified"          // the description doesn't match the object
			}
			let data = results.data;
			let view_ui = document.getElementById("ViewUI");
			if (view_ui.hasChildNodes()) while (view_ui.firstChild) view_ui.removeChild(view_ui.firstChild);
			if (data.length > 0) {
				for (let i = 0; i < data.length; i++) {
					let view_container = document.createElement("tr");
					view_container.id = "row_"+data[i].object_id+"_"+data[i].object_name.split("_").join(" ")+"_"+data[i].anno_id
					view_container.style.width = "100%";
					view_ui.appendChild(view_container);
					ReactDOM.render(<ViewUI object_id={data[i].object_id} object_name={data[i].object_name.split("_").join(" ")} anno_id={data[i].anno_id} status={status_map[data[i].status]} description={data[i].description}/>, view_container, function() {
						this.btn["view_"+data[i].object_id+"_"+data[i].object_name.split("_").join(" ")+"_"+data[i].anno_id] = document.getElementById("view_"+data[i].object_id+"_"+data[i].object_name.split("_").join(" ")+"_"+data[i].anno_id);
						this.btn["scene_"+data[i].object_id+"_"+data[i].object_name.split("_").join(" ")+"_"+data[i].anno_id] = document.getElementById("scene_"+data[i].object_id+"_"+data[i].object_name.split("_").join(" ")+"_"+data[i].anno_id);
						this.btn["submit_"+data[i].object_id+"_"+data[i].object_name.split("_").join(" ")+"_"+data[i].anno_id] = document.getElementById("submit_"+data[i].object_id+"_"+data[i].object_name.split("_").join(" ")+"_"+data[i].anno_id);
						this.add_listener(this.btn["view_"+data[i].object_id+"_"+data[i].object_name.split("_").join(" ")+"_"+data[i].anno_id], "click", this.on_click_operation, "view_"+data[i].object_id+"_"+data[i].object_name.split("_").join(" ")+"_"+data[i].anno_id);
						this.add_listener(this.btn["scene_"+data[i].object_id+"_"+data[i].object_name.split("_").join(" ")+"_"+data[i].anno_id], "click", this.on_click_operation, "scene_"+data[i].object_id+"_"+data[i].object_name.split("_").join(" ")+"_"+data[i].anno_id);
						this.add_listener(this.btn["submit_"+data[i].object_id+"_"+data[i].object_name.split("_").join(" ")+"_"+data[i].anno_id], "click", this.on_click_operation, "submit_"+data[i].object_id+"_"+data[i].object_name.split("_").join(" ")+"_"+data[i].anno_id);
						this.add_listener(document.getElementById("description_"+data[i].object_id+"_"+data[i].object_name.split("_").join(" ")+"_"+data[i].anno_id), "click", this.on_click_div_description, data[i].object_id+"_"+data[i].object_name.split("_").join(" ")+"_"+data[i].anno_id);
					
						if (status_map[data[i].status] == "verified") {
							view_container.style.backgroundColor = "#ebf8ff";
						}
					}.bind(this));
				}
			}

			for (let i = 0; i < data.length; i++) {
				if (status_map[data[i].status] == "unverified") {
					document.getElementById("row_"+data[i].object_id+"_"+data[i].object_name.split("_").join(" ")+"_"+data[i].anno_id).scrollIntoView(true);
					break;
				}
			}
		});
	}

	render_mesh_surface() {
		this.scene_mesh.material = new THREE.MeshStandardMaterial( { vertexColors: THREE.VertexColors, metalness: 0.0 } );
	}

	render_mesh_annotated() {
		this.scene_mesh.material = new THREE.MeshStandardMaterial( { vertexColors: THREE.VertexColors, metalness: 0.0, transparent: true, opacity: 0.1 } );
	}

	/********************************************
     *************       Utils      *************
     ********************************************/

	get_resource(params) {
		this.resources = new Object();
		this.resources.app = "MeshVerify"
		this.resources.username = params.username;
		this.resources.root = params.scannet;
		this.resources.scene_id = params.scene_id;
		this.resources.scene_object = params.scene_object;
		this.resources.scene_object_id = this.get_scene_object_id();
		this.resources.scene_object_name = this.get_scene_object_name();
		this.resources.scene_object_dict = this.get_scene_object_dict();
		this.resources.scene_frame = params.scene_frame;
		this.resources.scene_list = params.scene_list;
		this.resources.scene_mesh = this.resources.scene_id + "_vh_clean_2.ply";
		this.resources.frames = "color";
		this.resources.poses = "pose";
		this.resources.palette = this.get_instance_palette();
	}

	get_scene_object_id() {
		let scene_object_id = new Array();
		for (let i = 0; i < this.resources.scene_object.length; i++) {
			scene_object_id.push(this.resources.scene_object[i].split(".")[0].split("_")[0])
		}

		return scene_object_id;
	}

	get_scene_object_name() {
		let scene_object_name = new Array();
		for (let i = 0; i < this.resources.scene_object.length; i++) {
			scene_object_name.push(this.resources.scene_object[i].split(".")[0].split("_").slice(1).join(" "))
		}

		return scene_object_name;
	}

	get_scene_object_dict() {
		let scene_object_dict = new Object();
		for (let i = 0; i < this.resources.scene_object_id.length; i++) {
			scene_object_dict[this.resources.scene_object_id[i]] = this.resources.scene_object_name[i];
		}

		return scene_object_dict;
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
		let new_indices = new Array();
		let max_len = 100;
		for (let i = 0; i < this.resources.scene_object_id.length; i++) {
			let indices = this.object_gallery[parseInt(this.resources.scene_object_id[i])].slice(0, max_len);
			new_indices = new_indices.concat(indices);
		}
		new_indices = [...new Set(new_indices)];
		this.num_frames = new_indices.length;

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
				if (intersected[0].object.material.emissive.getHex() != 0xff0000) {
					let intersected_id = intersected[0].object.name.split("_")[0];
					if (this.intersected && this.intersected.material.emissive.getHex() != 0xff0000) this.intersected.material.emissive.setHex(this.object_hexs[intersected_id]);
					this.intersected = intersected[0].object;
					this.intersected_id =  intersected_id
					this.intersected.material.emissive.setHex(0x0059ff);
				}
			} 
			else {
				if (this.intersected && this.intersected.material.emissive.getHex() != 0xff0000) {
					this.intersected.material.emissive.setHex(this.object_hexs[this.intersected_id]);
				}
				this.intersected = null;
			}
		}
	}

	// return a hash string
	get_hash(str) {
		var hash = 0, i, chr;
		if (str.length === 0) return hash;
		for (i = 0; i < str.length; i++) {
			chr   = str.charCodeAt(i);
			hash  = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		if (hash < 0) hash = -hash;
		return hash.toString();
	}
	
	set_loading_bar(progress, status) {
		let loading_bar = document.getElementById("loading_bar");
		let loading_status = document.getElementById("loading_status");
		loading_bar.style.width = progress;
		loading_status.innerHTML = status;
	}

	set_preloading_progress(progress) {
		let frame_loading_bar = document.getElementById("frame_loading_bar");
		let frame_loading_progress = document.getElementById("frame_loading_progress");
		frame_loading_bar.style.width = progress + "%";
		frame_loading_progress.innerHTML = progress;
	}

	set_mesh(geometry, material) {
		let mesh = new THREE.Mesh(geometry, material);
		mesh.position.x = -this.scene_geometry_center.x;
		mesh.position.y = -this.scene_geometry_center.y;
		mesh.position.z = -this.scene_geometry_center.z;

		return mesh
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

	preload_frame() {
		this.resources.preload_frames = new Object();
		this.resources.num_preload = 0

		for (let i = 0; i < this.indices.length; i++) {
			let frame = new Image();
			frame.onload = function () {
				this.resources.preload_frames[this.indices[i]] = frame;
				this.resources.num_preload++;
				this.set_preloading_progress(Math.round(100 * this.resources.num_preload / this.num_frames));
				if (this.resources.num_preload == this.num_frames) {
					this.preload_complete = true;
					document.getElementById("frame_loading_container").style.display = "none";
					console.log("preloading complete")
				}
			}.bind(this);
			// frame.src = path.join("/apps/resource/frame/", this.resources.scene_id, this.indices[i] + ".jpg");
			frame.src = path.join("/apps/resource/frame/reduced", this.resources.scene_id, this.indices[i] + ".jpg");
		}
	}

	get_timestamp() {
		let stamp = new Date();
		let year = ""+stamp.getFullYear();
		let month = ""+(stamp.getMonth()+1);
		let date = ""+stamp.getDate();
		let hour = ""+stamp.getHours();
		let minute = ""+stamp.getMinutes();
		let second = ""+stamp.getSeconds();
	
		// format
		if (month.length < 2) month = "0" + month;
		if (date.length < 2) date = "0" + date;
		if (hour.length < 2) hour = "0" + hour;
		if (minute.length < 2) minute = "0" + minute;
		if (second.length < 2) second = "0" + second; 
	
		let date_str = year+'-'+month+'-'+date;
		let time_str = hour+":"+minute+":"+second;
		let date_time = date_str+'_'+time_str;
	
		return date_time;
	}

	get_time_passed(start, end) {
		let time = (end - start) * 0.001;
		if (time < 60) {
			time = time + "s";
		}
		else {
			let min = Math.floor(time / 60);
			let sec = time - min;
			time = min + "m " + sec + "s";
		}

		return time;
	}

	send_message(message) {
		let entry = new Object()
		entry.app = this.resources.app;
		entry.worker_id = this.resources.username;
		entry.assignment_id = this.resources.scene_id;
		entry.message = message;
		window.xhr_post(JSON.stringify(entry), path.join("/apps/comm/message"));
	}

	send_time(message, time) {
		let entry = new Object()
		entry.app = this.resources.app;
		entry.worker_id = this.resources.username;
		entry.assignment_id = this.resources.scene_id;
		entry.message = message;
		entry.time = time;
		window.xhr_post(JSON.stringify(entry), path.join("/apps/comm/time"));
	}

	init_on_focus(mode, object_id, object_name, anno_id) {
		this.start = (new Date()).getTime();
		this.focused = new Object();
		this.focused.mode = mode;
		this.focused.row = document.getElementById("row_"+object_id+"_"+object_name+"_"+anno_id)
		this.focused.description = document.getElementById("description_"+object_id+"_"+object_name+"_"+anno_id);
		this.focused.description.style.fontWeight = "bold";
		this.focused.status = document.getElementById("status_"+object_id+"_"+object_name+"_"+anno_id)
		this.focused.object_id = object_id;
		this.focused.object_name = object_name;
		this.focused.anno_id = anno_id;
		// init selected
		this.focused[mode] = new Object();
		this.focused[mode].selected_ids = new Array();
		this.focused[mode].selected_objects = new Array();
		// submission flag
		this.focused.submitted = false;
		// comment
		this.focused.comment = null;
		this.focused.reworded = null;
	}

	init_object_hex() {
		// init color
		for (let i = 0; i < this.object_mesh.length; i++) {
			this.object_mesh[i].material.emissive.setHex(this.object_hexs[this.resources.scene_object_id[i]]);
		}
	}

	set_on_focus(mode, object_id, object_name, anno_id) {
		// init focus
		if (!(this.focused)) {
			this.init_on_focus(mode, object_id, object_name, anno_id);
			return true;
		}
		else {
			this.focused.mode = mode;
			if (!(this.focused[mode])) {
				// init selected
				this.focused[mode] = new Object();
				this.focused[mode].selected_ids = new Array();
				this.focused[mode].selected_objects = new Array();
			}
			if ("{0}_{1}".format(this.focused.object_id, this.focused.anno_id) != "{0}_{1}".format(object_id, anno_id)) {
			// if ((this.focused.object_id != object_id) && (this.focused.anno_id != anno_id)) {
				if (!(this.focused.submitted)) {
					let answer = confirm("Are you sure you want to go to another description without submitting? All current selections would be gone")
					if (answer) {
						this.focused.description.style.fontWeight = "normal";
						this.init_on_focus(mode, object_id, object_name, anno_id);
						return true;
					}
					else {
						return false;
					}
				}
				else {
					this.focused.description.style.fontWeight = "normal";
					this.init_on_focus(mode, object_id, object_name, anno_id);
					return true;
				}
			}
			return true;
		}
	}

	view_operation() {
		// init color
		this.init_object_hex();

		// set color
		if (this.focused.view) {
			if (this.focused.view.selected_objects) {
				for (let i = 0; i < this.focused.view.selected_objects.length; i++) {
					this.focused.view.selected_objects[i].material.emissive.setHex(0xff0000);
				}
			}
		}

		// query record
		window.xhr_json("GET", path.join("/apps/database/mesh2cap/query/", this.resources.scene_id, this.focused.object_id, this.focused.anno_id)).then(results => {
			// set new camera
			let record = results.data[0];
			let matrixWorld = new THREE.Matrix4();
			matrixWorld.fromArray(record.camera.matrixWorld);
			let new_pos = new THREE.Vector3();
			new_pos.setFromMatrixPosition(matrixWorld);
			let new_lookat = new THREE.Vector3();
			new_lookat.fromArray(record.camera.lookat);
			let new_up = new THREE.Vector3(0, 0, 1);
			this.window_mesh.set_view(new_pos, new_up, new_lookat);
			this.render_mesh_annotated();

			// log
			this.message = "set view point";
			this.time = this.get_time_passed(this.start, (new Date()).getTime());
			this.send_time(this.message, this.time);

			// re-initiate start
			this.start = (new Date()).getTime();
		});
	}

	scene_operation() {
		this.init_camera();
		// init color
		this.init_object_hex();
		
		// set color
		if (this.focused.scene) {
			if (this.focused.scene.selected_objects) {
				for (let i = 0; i < this.focused.scene.selected_objects.length; i++) {
					this.focused.scene.selected_objects[i].material.emissive.setHex(0xff0000);
				}
			}
		}
	}

	submit_operation() {
		window.xhr_json("GET", path.join("/apps/database/mesh2cap/query", this.resources.scene_id, this.focused.object_id, this.focused.anno_id)).then(results => {
			let record = results.data[0];
			record.status = "verified";
			record.verify.assignment_id = this.get_timestamp();
			record.verify.hit_id = this.get_timestamp();
			record.verify.worker_id = this.resources.username;
			record.verify.selected_in_view = this.focused.view.selected_ids.join(" ");
			record.verify.selected_in_scene = this.focused.scene.selected_ids.join(" ");
			record.verify.comment = this.focused.comment;
			record.verify.reworded = this.focused.reworded;
			
			// log
			this.message = "verify the description";
			this.time = this.get_time_passed(this.start, (new Date()).getTime());
			this.send_time(this.message, this.time);

			// re-initiate start
			this.start = (new Date()).getTime();

			// submit
			window.xhr_post(JSON.stringify(record), "/apps/database/mesh2cap/save").then(() => {
				console.log("save record to database");
				
				// log
				this.message = "save data to database";
				this.time = this.get_time_passed(this.start, (new Date()).getTime());
				this.send_time(this.message, this.time);
				
				// update
				this.focused.submitted = true;
				this.init_object_hex();
				this.render_annotation_results();

				// go to next one
				this.focus_next();
			});
		});
	}

	focus_next() {
		window.xhr_json("GET", path.join("/apps/database/mesh2cap/query", this.resources.scene_id, "-1", "-1")).then(results => {
			let data = results.data;
			let status_map = {
				"unverified": "unverified",     // the description hasn't been verified yet
				"verified": "verified"          // the description doesn't match the object
			}
			let focus_flag = false
			for (let i = 0; i < data.length; i++) {
				if (status_map[data[i].status] == "unverified") {
					document.getElementById("row_"+data[i].object_id+"_"+data[i].object_name.split("_").join(" ")+"_"+data[i].anno_id).scrollIntoView(true);
					if(this.set_on_focus("view", data[i].object_id, data[i].object_name.split("_").join(" "), data[i].anno_id)) this.view_operation();
					focus_flag = true;
					break;
				}
			}
			
			if (!focus_flag) {
				alert("This scene has already been completely verified");
			}
		});
	}

	/********************************************
     *************  Event handlers  *************
     ********************************************/

	on_click_start() {
		this.message = "start annotation";
		this.send_message(this.message);
		console.log(this.message);
		// this.init_root_ui();
		document.getElementById("start_container").style.display = "none";
	}

	on_click_operation(id) {
		return function() {
			// setting
			let operation = id.split("_")[0];
			let object_id = id.split("_")[1];
			let object_name = id.split("_")[2];
			let anno_id = id.split("_")[3];
			if (operation == "view") {
				if(this.set_on_focus(operation, object_id, object_name, anno_id)) this.view_operation();
			}
			else if (operation == "scene") {
				if(this.set_on_focus(operation, object_id, object_name, anno_id)) this.scene_operation();
			}
			else {
				// submission check
				if (!(this.focused)) {
					alert("Please click \"View\" or \"Scene\" to start the verification");
				}
				else if (!(this.focused.object_id == object_id && this.focused.anno_id == anno_id)) {
					alert("Please submit only the focused item")
				}
				else if (this.focused.view && this.focused.view.selected_objects.length == 0) {
					alert("Please select the objects in \"View\" before submission")
				}
				else if (this.focused.scene && this.focused.scene.selected_objects.length == 0) {
					alert("Please select the objects in \"Scene\" before submission")
				}
				else {
					this.submit_operation();
				}
			}	
				
		}.bind(this);
	}

	on_click_div_description(id) {
		return function() {
			let object_id = id.split("_")[0];
			let object_name = id.split("_")[1];
			let anno_id = id.split("_")[2];
			if (this.focused && "{0}_{1}".format(object_id, anno_id) == "{0}_{1}".format(this.focused.object_id, this.focused.anno_id)) {
				ReactDOM.render(<CommentContent/>, document.getElementById("comment_content"), function() {
					this.comment_container = document.getElementById("comment_container");
					this.btn.submit_comment = document.getElementById("submit_comment");
					this.btn.close_comment = document.getElementById("close_comment");
					this.add_listener(this.btn.submit_comment, "click", this.on_click_submit_comment, id);
					this.add_listener(this.btn.close_comment, "click", this.on_click_close_comment);

					let description_text = document.getElementById("description_text");
					description_text.innerHTML = this.focused.description.innerHTML;

					this.comment_flag = true;
		
					this.comment_container.style.display = "block";
				}.bind(this));
			}
			else {
				alert("Please click \"View\" or \"Scene\" to focus on the description first");
			}
			
		}.bind(this);
	}

	on_click_btn_instruction() {
		this.instruction.style.display = "block";
		this.instruction.scrollTop = 0;
	}

	on_click_close_instruction() {
		this.instruction.style.display = "none";
	}

	on_click_btn_control() {
		this.control.style.display = "block";
		this.control.scrollTop = 0;
	}

	on_click_close_control() {
		this.control.style.display = "none";
	}

	on_click_submit_comment(id) {
		return function() {
			let object_id = id.split("_")[0];
			let object_name = id.split("_")[1];
			let anno_id = id.split("_")[2];
			let comment_text = document.getElementById("comment_text");
			let comment = comment_text.value.trim();
			let reworded_text = document.getElementById("reworded_text");
			let reworded = reworded_text.value.trim();

			this.focused.comment = comment;
			this.focused.reworded = reworded;
			
			this.comment_container.style.display = "none";

			this.comment_flag = false;
			
			this.remove_listener(this.btn.submit_comment);
			this.remove_listener(this.btn.close_comment);

			comment_text.value = "";
			reworded_text.value = "";

		}.bind(this);

		
	}

	on_click_close_comment() {
		document.getElementById("comment_text").value = "";

		this.comment_container.style.display = "none";

		this.comment_flag = false;

		this.remove_listener(this.btn.submit_comment);
		this.remove_listener(this.btn.close_comment);
	}

	on_keydown_keyc(event) {
		if (this.window_mesh.is_mouse_in_model_panel() && event.keyCode === 67 && !this.comment_flag) {
			event.preventDefault();
			this.mesh_view = (this.mesh_view + 1) % 2;
			if (this.mesh_view) {
				this.render_mesh_surface();
			}
			else {
				this.render_mesh_annotated();
			}
		}
	}

	on_keydown_keyf(event) {
		if (event.keyCode === 70 && !this.comment_flag) {
			this.focus_next();
		}
	}

	on_keydown_keys(event) {
		if (event.keyCode === 83 && !this.comment_flag) {
			// submission check
			console.log(this.focused)
			if (!(this.focused)) {
				alert("Please click \"View\" or \"Scene\" to start the verification");
			}
			else if (!(this.focused.view) || this.focused.view.selected_objects.length == 0) {
				alert("Please select the objects in \"View\" before submission")
			}
			else if (!(this.focused.scene) || this.focused.scene.selected_objects.length == 0) {
				alert("Please select the objects in \"Scene\" before submission")
			}
			else {
				this.submit_operation();
			}
		}
	}

	on_keydown_keyr(event) {
		if (event.keyCode === 82 && !this.comment_flag) {
			if(this.set_on_focus("scene", this.focused.object_id, this.focused.object_name, this.focused.anno_id)) this.scene_operation();
		}	
	}

	on_keydown_keyv(event) {
		if (event.keyCode === 86 && !this.comment_flag) {
			if(this.set_on_focus("view", this.focused.object_id, this.focused.object_name, this.focused.anno_id)) this.view_operation();
		}	
	}

	on_window_resize(event) {
		this.window_mesh.on_window_resize(event);
		this.renderer.setSize( this.window_mesh.window_width, this.window_mesh.window_height );
	}

	on_window_scroll(event) {
		this.window_mesh.measure();
	}

	mouseclick(event) {}

    mousedown(event) {
		if (this.window_mesh.is_mouse_in_model_panel()) {
			if (event.button == 0 && this.focused) {
				let intersected = this.raycaster.intersectObjects(this.scene.children.slice(3));
				if (intersected.length > 0) {
					let selected = intersected[0].object;
					let selected_id = selected.name.split("_")[0];
					let mode = this.focused.mode;
	
					if (this.focused[mode].selected_ids.includes(selected_id)) {
						let idx = this.focused[mode].selected_ids.indexOf(selected_id);
						// re-init the color
						this.focused[mode].selected_objects[idx].material.emissive.setHex(0x0059ff);
						// remove
						this.focused[mode].selected_ids.splice(idx, 1);
						this.focused[mode].selected_objects.splice(idx, 1);
					}
					else {
						this.focused[mode].selected_ids.push(selected_id); // store the object_id						this.focused[mode].original_hexs.push(this.intersected.currentHex);
						this.focused[mode].selected_objects.push(selected); // store the object

						// color
						selected.material.emissive.setHex(0xff0000);
					}
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
			// this.window_mesh.pos_mouse.x = ((event.clientX - this.renderer.domElement.offsetLeft) / this.renderer.domElement.width ) * 2 - 1;
    		// this.window_mesh.pos_mouse.y = -((event.clientY - this.renderer.domElement.offsetTop) / this.renderer.domElement.height ) * 2 + 1;
			// this.window_mesh.navigation.mousemove(event);
		}
    }

    mousewheel(event) {
		if (document.getElementById("canvas_label_div")) document.getElementById("id_div_root").removeChild(this.canvas_label);
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

		window.addEventListener("resize", this.on_window_resize.bind(this));
		window.addEventListener("scroll", this.on_window_scroll.bind(this));
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
	
	remove_listener(element) {
		let new_element = element.cloneNode(true);
		element.parentNode.replaceChild(new_element, element);
    }

	create_stats() {
		this.stats = new Stats();
		this.stats.domElement.style.position = "absolute";
		this.stats.domElement.style.left = document.getElementById("canvas_container").style.marginLeft;
		document.getElementById("canvas_container").appendChild(this.stats.dom);
	}

}

window.MeshVerify = MeshVerify;
