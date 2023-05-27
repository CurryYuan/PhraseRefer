import React from 'react';
import ReactDOM from 'react-dom';
import StartUI from './view/StartUI';
import RootUI from './view/RootUI';
import EndUI from './view/EndUI';
import InstructionContent from "./view/InstructionContent";
import ControlContent from "./view/ControlContent";
import WindowManager from "../Common/WindowManager"
import Stats from "../../lib/utils/stats.min.js";
import * as utils from "../Common/utils";
import * as nyuv2 from "../Common/NYUv2_colors";
import * as THREE from 'three/build/three';
import * as path from "path";

window.THREE = THREE;

class MeshAnnotator {

	init(params) {
		// set params
		this.params = params;
		this.log = new Array();
		this.message = new Array();

		// setup resources
		this.get_resource(this.params);

		// init 	
		this.init_root_ui();
	}

	init_root_ui() {
		// render page
		ReactDOM.render(<RootUI/>, document.getElementById('id_div_root'), function() {
			let start = (new Date()).getTime();
			// flags
			this.cur_page_id = 0;
			this.is_surface = true;
			this.is_highlight = true;
			this.is_resource_set = false;

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

			// setup input
			this.input_text = document.getElementById("input_text");
			this.input_text.value = "";

			// setup button
			this.btn = new Object();
			this.btn.none = document.getElementById("btn_none");
			this.btn.surface = document.getElementById("btn_surface");
			this.btn.submit = document.getElementById("submit_btn");
			this.btn.submit.innerHTML = (this.resources.page_id < this.resources.batch_size - 1) ? "Next" : "Submit";
			this.btn.instruction = document.getElementById("instruction_helper");
			this.btn.control = document.getElementById("control_helper");
			this.btn.close_instruction = document.getElementById("close_instruction");
			this.btn.close_control = document.getElementById("close_control");
			this.btn.submit.disabled = true;

			this.add_listener(this.btn.none, "click", this.on_click_btn_none);
			this.add_listener(this.btn.surface, "click", this.on_click_btn_surface);
			this.add_listener(this.btn.submit, "click", this.on_click_btn_submit);
			this.add_listener(this.btn.instruction, "click", this.on_click_btn_instruction);
			this.add_listener(this.btn.control, "click", this.on_click_btn_control);
			this.add_listener(this.btn.close_instruction, "click", this.on_click_close_instruction);
			this.add_listener(this.btn.close_control, "click", this.on_click_close_control);
			this.add_listener(document, "keydown", this.on_keydown_keyc);
			this.add_listener(document, "keydown", this.on_keydown_keyenter);
			

			// setup window mesh
			this.window_mesh = new WindowManager("canvas_container", "canvas");
			this.window_mesh.init();
			this.attach_listener();

			// setup scene
			this.scene = new THREE.Scene();
			this.scene.background = new THREE.Color( 0xffffff );
			// Lights
			this.add_mesh(this.scene, [new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6)]);
			this.add_mesh(this.scene, [this.window_mesh.camera]);
			this.add_mesh(this.window_mesh.camera, [new THREE.PointLight(0xffffff, 0.5)]);

			// renderer
			this.context = this.window_mesh.canvas.getContext("webgl2");
			this.renderer = new THREE.WebGLRenderer( { canvas: this.window_mesh.canvas, context: this.context } );
			this.renderer.setSize( this.window_mesh.window_width, this.window_mesh.window_height );

			// raycaster
			this.raycaster = new THREE.Raycaster();
			this.intersected = null;

			// start loading
			document.getElementById("loading_container").style.display = "block";
			document.getElementById("image_container").style.display = "none";
			this.set_loading_bar("20%", "loading resources...")

			// primary promises for loading meshes
			let promises = [
				window.load_ply_file(path.join("/apps/resource/mesh/", this.resources.scene_id, this.resources.scene_mesh)),
				window.xhr_json("GET", path.join("/apps/resource/gallery/", this.resources.scene_id)),
				window.xhr_json("GET", path.join("/apps/resource/pose/", this.resources.scene_id))
			];
			for (let i = 0; i < this.resources.scene_object_name.length; i++) {
				promises.push(window.load_ply_file(path.join("/apps/resource/object/", this.resources.scene_id, this.resources.scene_object_name[i]+".ply")))
			}
			Promise.all(promises).then(values => {
				let message = "load resource";
				let time = this.get_time_passed(start, (new Date()).getTime());
				this.send_time(message, time);
				
				// unpack data 
				start = (new Date()).getTime();
				this.set_loading_bar("35%", "parsing resources...")
				this.scene_geometry = values[0];
				this.scene_geometry.computeVertexNormals();
				this.scene_geometry.computeBoundingSphere();
				this.scene_geometry.computeBoundingBox();
				this.scene_geometry_center = this.get_object_center(this.scene_geometry);
				this.scene_geometry_bbox = this.get_object_bounding_box(this.scene_geometry);

				this.object_geometry = new Array();
				this.object_geometry_center = new Array();
				this.object_geometry_bbox = new Array();
				for (let i = 0; i < this.resources.scene_object_name.length; i++) {
					this.object_geometry.push(values[i+3]);
					this.object_geometry[i].name = this.resources.scene_object_name[i];
					this.object_geometry[i].computeVertexNormals();
					this.object_geometry[i].computeBoundingSphere();
					this.object_geometry[i].computeBoundingBox();
					this.object_geometry_center.push(this.get_object_center(this.object_geometry[i]));
					this.object_geometry_bbox.push(this.get_object_bounding_box(this.object_geometry[i]));
				}

				this.object_gallery = values[1];

				this.poses = this.parse_pose(values[2]);

				/********************************************
				 ******     setup render resources    *******
				********************************************/

				this.set_loading_bar("55%", "setting resources...")
				// setup scene background mesh
				this.scene_mesh = this.set_mesh(
					this.scene_geometry,
					new THREE.MeshStandardMaterial({vertexColors: THREE.VertexColors, metalness: 0.0})
				);
				this.add_mesh(this.scene, [this.scene_mesh]);
				// setup object meshes
				this.object_mesh = new Array();
				for (let i = 0; i < this.object_geometry.length; i++) {
					this.object_mesh.push(this.set_mesh(
						this.object_geometry[i],
						new THREE.MeshStandardMaterial({vertexColors: THREE.VertexColors, metalness: 0.0})
					));
				}

				message = "initiate resource";
				time = this.get_time_passed(start, (new Date()).getTime());
				this.send_time(message, time);

				// // axis
				// this.axis = new THREE.AxesHelper();
				// this.scene.add(this.axis);

				// finish loading
				this.set_loading_bar("100%", "complete!")
				document.getElementById("loading_container").style.display = "none";
				document.getElementById("image_container").style.display = "block";
				console.log(this.scene)
				// start rendering
				this.init_camera();
				// this.create_stats();
				this.render();
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
		// setting
		// this.window_mesh.camera.add(this.camera_light);
		if (!this.is_resource_set) {
			this.set_resource();
		}
		let closest_pose = this.get_closest_pose();
		let nav_vector = new THREE.Vector3();
		this.window_mesh.camera.getWorldDirection(nav_vector);
		// render
		if (this.preload_complete) this.render_frame(closest_pose);
		this.renderer.render( this.scene, this.window_mesh.camera );
		this.window_mesh.advance(0, 8);
		// this.stats.end();
		requestAnimationFrame(this.render.bind(this));
	}

	render_frame(pose) {
		document.getElementById("image").src = this.resources.preload_frames[pose.index].src;
	}

	/********************************************
     *************        get       *************
     ********************************************/

	get_resource(params) {
		this.resources = new Object();
		this.resources.app = "Mesh2Cap"
		this.resources.root = params.scannet;
		this.resources.scene_id = params.scene_id;
		this.resources.object_id = params.object_id;                        // an array
		this.resources.anno_id = params.anno_id;                            // an array
		this.resources.object_name = params.object_name;                    // an array
		this.resources.scene_object_name = this.get_scene_object_name();    // an array
		this.resources.scene_frame = params.scene_frame;
		this.resources.scene_mesh = this.resources.scene_id + "_vh_clean_2.ply";
		this.resources.frames = "color";
		this.resources.poses = "pose";
		this.resources.batch_id = params.batch_id;
		this.resources.batch_size = parseInt(params.batch_size);
		this.resources.page_id = parseInt(params.page_id);
		this.resources.assignment_id = params.assignment_id;
		this.resources.hit_id = params.hit_id;
		this.resources.worker_id = params.worker_id;
	}

	set_resource() {
		// randomly pick every 10 frames
		let start = (new Date()).getTime();
		this.indices = this.get_frame_indices();
		let message = "set frame indices";
		let time = this.get_time_passed(start, (new Date()).getTime());
		this.send_time(message, time);

		// set mesh
		start = (new Date()).getTime();
		this.add_mesh(this.scene, [this.object_mesh[this.cur_page_id]]);
		document.getElementById("object_name").innerHTML = this.resources.object_name[this.cur_page_id].split("_").join(" ");
		this.set_highlight(true);
		this.set_camera();
		this.window_mesh.camera.updateMatrixWorld(true);
		message = "set object meshes";
		time = this.get_time_passed(start, (new Date()).getTime());
		this.send_time(message, time);

		// preload frames
		start = (new Date()).getTime();
		this.preload_frame();
		message = "load frame images";
		time = this.get_time_passed(start, (new Date()).getTime());
		this.send_time(message, time);

		// set page indicator
		document.getElementById("page_id").innerHTML = this.cur_page_id + 1;
		document.getElementById("batch_size").innerHTML = this.resources.batch_size;
		this.is_resource_set = true;

		// set submit button
		this.btn.submit.innerHTML = (this.cur_page_id < this.resources.batch_size - 1) ? "Next" : "Submit";
	}

	get_time_passed(start, end) {
		let time = (end - start) * 0.001;
		if (time < 60) {
			time = time + "s";
		}
		else {
			min = Math.floor(time / 60);
			sec = time - min;
			time = min + "m " + sec + "s";
		}

		return time;
	}

	set_camera() {
		let rand_idx = Math.floor(Math.random() * this.indices.length);
		this.init_pos = (new THREE.Vector3()).setFromMatrixPosition(this.poses[parseInt(this.indices[rand_idx])]);
		this.init_pos.x -= this.scene_geometry_center.x;
		this.init_pos.y -= this.scene_geometry_center.y;
		this.init_pos.z -= this.scene_geometry_center.z;
		this.init_lookat = new THREE.Vector3(
			(this.object_geometry_center[this.cur_page_id].x - this.scene_geometry_center.x), 
			(this.object_geometry_center[this.cur_page_id].y - this.scene_geometry_center.y), 
			(this.object_geometry_center[this.cur_page_id].z - this.scene_geometry_center.z)
		)
		let up = new THREE.Vector3(0, 0, 1);
		this.window_mesh.set_view(this.init_pos, up, this.init_lookat);
	}

	next_resource() {
		this.remove_mesh(this.scene, [this.object_mesh[this.cur_page_id]]);
		this.cur_page_id++;
		this.input_text.value = "";
		this.is_resource_set = false;
	}

	get_scene_object_name() {
		let scene_object_name = new Array();
		for (let i = 0; i < this.resources.object_id.length; i++) {
			scene_object_name.push("{0}_{1}".format(this.resources.object_id[i], this.resources.object_name[i]));
		}

		return scene_object_name;
	}

	get_frame_indices() {
		let new_indices = [];
		let max_len = 200;
		new_indices = this.object_gallery[parseInt(this.resources.object_id[this.cur_page_id])].slice(0, max_len);
		
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
			try {
				// decode the frame camera rotation vector
				let pose_rotation = new THREE.Matrix4();
				pose_rotation.extractRotation(this.poses[i]);
				let pose_rotation_vector = (new THREE.Vector3(0, 0, 1)).applyMatrix4(pose_rotation);
				let rotation_angle = (pose_rotation_vector).angleTo(cur_rotation_vector);

				if (rotation_angle < closest_pose.angle) {
					closest_pose.angle = rotation_angle;
					closest_pose.index = this.indices[i];
					closest_pose.pose = this.poses[i];
				}
			}
			catch (err) {
				continue;
			}
		}
		return closest_pose;
	}

	get_object_center(geometry) {
		return geometry.boundingSphere.center;
	}

	get_object_bounding_box(geometry) {
		let bbox = geometry.boundingBox.clone();
		let offset = new THREE.Vector3(
			-this.scene_geometry_center.x,
			-this.scene_geometry_center.y,
			-this.scene_geometry_center.z
		)
		bbox.translate(offset)

		return bbox;
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

	// return a string without any whitespace, punctuation and with all words in lowercase
	get_true_string(str) {
		// remove punctuations
		str = str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
		// remove extra whitespaces
		str = str.replace(/\s{2,}/g," ");
		// convert to lowercase
		str = str.toLowerCase();

		return str;
	}

	set_highlight(is_highlight) {
		if (is_highlight) {
			if (this.is_surface) {
				this.scene_mesh.material = new THREE.MeshStandardMaterial({vertexColors: THREE.VertexColors, metalness: 0.0, transparent: true, opacity: 0.25});
			}
			else {
				this.scene_mesh.material = new THREE.MeshStandardMaterial({color: 0xbcbcbc, metalness: 0.0, transparent: true, opacity: 0.25});
			}
		}
		else {
			if (this.is_surface) {
				this.scene_mesh.material = new THREE.MeshStandardMaterial({vertexColors: THREE.VertexColors, metalness: 0.0});
			}
			else {
				this.scene_mesh.material = new THREE.MeshStandardMaterial({color: 0xbcbcbc, metalness: 0.0});
			}
		}
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
		this.preload_complete = false;
		document.getElementById("frame_loading_container").style.display = "block";
		document.getElementById("image").style.display = "none";
		this.btn.submit.disabled = true;
		this.resources.preload_frames = new Object();
		this.resources.num_preload = 0
		for (let i = 0; i < this.indices.length; i++) {
			let frame = new Image();
			frame.onload = function () {
				this.resources.preload_frames[this.indices[i]] = frame;
				this.resources.num_preload++;
				this.set_preloading_progress(Math.round(100 * this.resources.num_preload / this.indices.length));
				if (Object.keys(this.resources.preload_frames).length == this.indices.length) {
					this.preload_complete = true;
					document.getElementById("frame_loading_container").style.display = "none";
					document.getElementById("image").style.display = "block";
					this.btn.submit.disabled = false;
					console.log("preloading complete")
				}
			}.bind(this);
			// frame.src = path.join("/apps/resource/frame/", this.resources.scene_id, this.indices[i] + ".jpg");
			frame.src = path.join("/apps/resource/frame/reduced", this.resources.scene_id, this.indices[i] + ".jpg");
		}
	}
	send_message(message) {
		let entry = new Object()
		entry.app = this.resources.app;
		entry.worker_id = this.resources.worker_id;
		entry.assignment_id = this.resources.assignment_id;
		entry.message = message;
		window.xhr_post(JSON.stringify(entry), path.join("/apps/comm/message"));
	}

	send_time(message, time) {
		let entry = new Object()
		entry.app = this.resources.app;
		entry.worker_id = this.resources.worker_id;
		entry.assignment_id = this.resources.assignment_id;
		entry.message = message;
		entry.time = time;
		window.xhr_post(JSON.stringify(entry), path.join("/apps/comm/time"));
	}

	check_equal(a, b) {
		let precision = 10;
		let flag_x = a.x.toString().substring(0, precision) == b.x.toString().substring(0, precision);
		let flag_y = a.y.toString().substring(0, precision) == b.y.toString().substring(0, precision);
		let flag_z = a.z.toString().substring(0, precision) == b.z.toString().substring(0, precision);
		
		return flag_x && flag_y && flag_z
	}

	check_inside(point, container) {
		return container.containsPoint(point);
	}

	check_visible() {
		let frustum = new THREE.Frustum();
		let camera = this.window_mesh.camera;
		let matrix = (new THREE.Matrix4()).multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
		frustum.setFromMatrix(matrix);
		let flag = true;
		// check if object appears in the view
		if (!frustum.intersectsBox(this.object_geometry_bbox[this.cur_page_id])) {
			flag = false;
		}
		// check if object is completely visible
		// only when the the object appears in the view
		else {
			for (let i = 0; i < 6; i++) {
				if (frustum.planes[i].intersectsBox(this.object_geometry_bbox[this.cur_page_id])) {
					flag = false;
				}
			}
		}

		return flag;
	}

	check_length(description) {
		let sentences = description.split(".");
		let flag = false;
		if (sentences.length >= 3) flag = true;

		return flag;
	}

	/********************************************
     *************  Event handlers  *************
     ********************************************/

	on_click_start() {
		let message = "start annotation";
		console.log(message);
		this.send_message(message);
		// this.init_root_ui();
		document.getElementById("start_container").style.display = "none";
	}

	on_click_btn_none() {
		console.log("show the mesh geometry");
		this.is_surface = false;
		this.object_mesh.material = new THREE.MeshStandardMaterial( { color: 0xbcbcbc, metalness: 0.0 } );
		this.set_highlight(this.is_highlight)
	}

	on_click_btn_surface() {
		console.log("show the mesh surface");
		this.is_surface = true
		this.object_mesh.material = new THREE.MeshStandardMaterial( { vertexColors: THREE.VertexColors, metalness: 0.0 } );
		this.set_highlight(this.is_highlight)
	}

	on_click_btn_submit() {
		// disable the submission until the next resource is ready
		this.btn.submit.disabled = true;

		// dump results
		let record = new Object();
		record.scene_id = this.resources.scene_id;
		record.object_id = this.resources.object_id[this.cur_page_id];
		record.anno_id = this.resources.anno_id[this.cur_page_id];
		record.object_name = this.resources.object_name[this.cur_page_id];
		record.description = this.input_text.value.trim();
		record.camera = new Object();
		record.camera.matrixWorld = this.window_mesh.camera.matrixWorld.toArray();
		record.camera.dof = this.window_mesh.camera.position.toArray().concat(this.window_mesh.camera.rotation.toArray().slice(0, -1));
		record.camera.lookat = this.window_mesh.navigation.target.toArray();
		record.camera.center = this.scene_geometry_center.toArray();
		record.status = "unverified";
		record.annotate = new Object();
		record.annotate.assignment_id = this.resources.assignment_id;
		record.annotate.hit_id = this.resources.hit_id;
		record.annotate.worker_id = this.resources.worker_id;
		record.verify = new Object();
		record.verify.assignment_id = null;
		record.verify.hit_id = null;
		record.verify.worker_id = null;
		record.verify.selected_in_view = null;
		record.verify.selected_in_scene = null;
		record.verify.comment = null;
		record.verify.reworded = null;

		// submission check
		window.xhr_json("GET", path.join("/apps/database/mesh2cap/query", this.resources.scene_id, this.resources.object_id[this.cur_page_id], "-1")).then(results => {
			let duplicated = 0;
			for (let i = 0; i < results.data.length; i++) {
				let cur_description = this.get_true_string(record.description);
				let ref_description = this.get_true_string(results.data[i].description);
				if (cur_description === ref_description) {
					duplicated++;
				}
			}
			// check if duplicated
			if (duplicated > 0) {
				let message = "The description is duplicated";
				this.send_message(message);
				alert("The description is unfortunately duplicated. Please avoid copying and pasting previous descriptions :)");
				this.btn.submit.disabled = false;
			}
			// check if the input is empty
			else if (record.description.length == 0) {
				let message = "Empty submission";
				this.send_message(message);
				alert("Please input your description :)");
				this.btn.submit.disabled = false;
			}
			// check if the input contains two sentence
			else if (!this.check_length(record.description)) {
				let message = "The description is too short";
				this.send_message(message);
				alert("Your description is too short. Please write at least two sentences and end each one with a period :)");
				this.btn.submit.disabled = false;
			}
			// check if the view point is moved
			else if (this.check_equal(this.init_pos, this.window_mesh.camera.position)) {
				let message = "The view point is unchanged";
				this.send_message(message);
				alert("You didn't choose your own view point. Please move the scene for a bit and make sure the object can be clearly seen :)");
				this.btn.submit.disabled = false;
			}
			// check if the view point is outside the scene
			else if (!this.check_inside(this.window_mesh.camera.position, this.scene_geometry_bbox)) {
				let message = "The view point is outside the scene";
				this.send_message(message);
				alert("Your view point is outside the scene. Please choose a view point inside the scene :)");
				this.btn.submit.disabled = false;
			}
			// // check if the object is focused
			// else if (!this.check_visible()) {
			// 	let message = "The view point is inside the object";
			// 	this.send_message(message);
			// 	alert("You're too close to the object. Please move the scene for a bit and make sure the object is clearly visible :)");
			// }
			else {
				let message = "Submission check passed";
				this.send_message(message);
				if (this.cur_page_id < this.resources.batch_size - 1) {
					let answer = confirm("Do you confirm the submission and go to the next page?")
					if (answer) {
						let message = "Go to page {0}".format(this.cur_page_id + 2);
						this.send_message(message);
						this.record = record;
						window.xhr_post(JSON.stringify(this.record), "/apps/database/mesh2cap/save").then(() => {
							console.log("save record from page {0} to database".format(this.cur_page_id + 1));
							this.next_resource();
						});					
					}
					else {
						this.btn.submit.disabled = false;
					}
				}
				else {
					let answer = confirm("Do you confirm the submission and leave this task?")
					if (answer) {
						let message = "Batch complete";
						this.send_message(message);
						this.record = record;
						window.xhr_post(JSON.stringify(this.record), "/apps/database/mesh2cap/save").then(() => {
							console.log("save record to database");
							if (this.resources.batch_size != 1) {
								/********************************************
								 *********  Amazon Mechanical Turk  *********
								********************************************/
								// update batch record
								window.xhr_json("GET", path.join("/apps/database/batchrecord/query", this.resources.scene_id, this.resources.batch_id)).then(results => {
									let entry = results.data[0];
									entry.status = "annotated";
									entry.annotate.assignment_id = this.resources.assignment_id;
									entry.annotate.hit_id = this.resources.hit_id;
									entry.annotate.worker_id = this.resources.worker_id;
									entry.annotate.batch_code = this.get_hash(this.resources.assignment_id+this.resources.hit_id+this.resources.worker_id);
									window.xhr_post(JSON.stringify(entry), "/apps/database/batchrecord/save").then(() => {
										ReactDOM.render(<EndUI batch_code={entry.annotate.batch_code}/>, document.getElementById('id_div_root'));
									});
								});
								
							}
							else {
								window.close();
							}
						});
					}
					else {
						this.btn.submit.disabled = false;
					}
				}
			}
		});
		
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

	on_keydown_keyc(event) {
		if (this.window_mesh.is_mouse_in_model_panel() && event.keyCode === 67) {
			event.preventDefault();
			if (this.is_highlight) {
				this.is_highlight = false;
				this.set_highlight(this.is_highlight);
			}
			else {
				this.is_highlight = true;
				this.set_highlight(this.is_highlight);
			}
		}
	}

	on_keydown_keyenter(event) {
		if (event.keyCode === 13) {
			event.preventDefault();
			this.on_click_btn_submit();
		}
	}

	on_window_resize(event) {
		this.window_mesh.on_window_resize(event);
		this.renderer.setSize( this.window_mesh.window_width, this.window_mesh.window_height );
	}

	on_window_scroll(event) {
		this.window_mesh.measure();
	}

	mouseclick ( event ) {}

    mousedown ( event ) {
		if (this.window_mesh.is_mouse_in_model_panel() && event.which == 2) {
			event.preventDefault();
		}
        this.window_mesh.mousedown(event);
    }

    mouseup( event ) {
        this.window_mesh.mouseup(event);
    }

    mousemove ( event ) {
        this.window_mesh.mousemove(event);
    }

    mousewheel ( event ) {
        this.window_mesh.navigation.mousewheel(event);
    }

    contextmenu( event ) {
        this.window_mesh.navigation.contextmenu(event);
    }

    attach_listener() {
        // -> event listeners
        this.contextmenu_ref = this.contextmenu.bind(this);
        this.mouseclick_ref = this.mouseclick.bind(this);
        this.mousemove_ref = this.mousemove.bind(this);
        this.mousedown_ref = this.mousedown.bind(this);
        this.mouseup_ref = this.mouseup.bind(this);
        this.mousewheel_ref = this.mousewheel.bind(this);

        this.window_mesh.add_listener('contextmenu', this.contextmenu_ref);
        this.window_mesh.add_listener('click', this.mouseclick_ref);
        this.window_mesh.add_listener('mousemove', this.mousemove_ref);
        this.window_mesh.add_listener('mousedown', this.mousedown_ref);
        this.window_mesh.add_listener('mouseup', this.mouseup_ref);
		this.window_mesh.add_listener('mousewheel', this.mousewheel_ref);
		
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

	/********************************************
     *************       Utils      *************
     ********************************************/

	create_stats() {
		this.stats = new Stats();
		this.stats.domElement.style.position = "absolute";
		this.stats.domElement.style.left = document.getElementById("canvas_container").style.marginLeft;
		document.getElementById("canvas_container").appendChild(this.stats.dom);
	}

}

window.MeshAnnotator = MeshAnnotator;
