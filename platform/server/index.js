var http = require("http");
var https = require("https");
var fs = require("fs");
var path = require("path");
var bodyParser = require("body-parser");
var request = require("request");
const querystring = require('querystring');
var compression = require('compression');
var express = require("express");
var async = require('async');

const util = require('util');
const url = require("url");

var app = express();
var router = express.Router();

var config = require(path.join(__dirname, "/Config.js"));

const MongoClient = require("mongodb").MongoClient
const ObjectId = require("mongodb").ObjectID;
const DB_URL = 'mongodb://localhost:27017/mesh2cap';
let DB_NAME = 'mesh2cap';

var session = require('client-sessions');

app.use(session({
	cookieName: 'session',
	secret: 'somethingsupersecret',
	duration: 5 * 60 * 60 * 1000,
	activeDuration: 3 *30 * 60 * 1000
}));



app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(bodyParser.json({
	limit: '50mb',
	type: 'application/json'
}));

app.use(compression());

app.use(express.static(path.join(__dirname, "/static")));
app.use(express.static(path.join(__dirname, "/../client")));
app.use(express.static(path.join(__dirname, "/../node_modules")));
app.use(express.static(path.join(__dirname, "/../resources")));



app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));


const scannet = new Object();


scannet.scans = "static/ScanNetV2/scans/";
scannet.objects = "static/ScanNetV2/ScanNet_objects/";
scannet.frames = "static/ScanNetV2/ScanNet_frames/";
scannet.previews = "static/ScanNetV2/ScanNet_previews/";
scannet.galleries = "static/ScanNetV2/ScanNet_galleries/";


scannet.annotation_batch = "static/annotation_batch.json"





const scene_list_file = fs.readFileSync("static/meta/ScanRefer_filtered.txt", "utf-8")
const scene_list = scene_list_file.split("\n")
const credential = JSON.parse(fs.readFileSync("static/credential.json"));

function organize_data(data) {
	organized = new Object();
	for (let i = 0; i < data.length; i++) {
		scene_id = data[i]["scene_id"];
		object_id = data[i]["object_id"];
		object_name = data[i]["object_name"];
		ann_id = data[i]["ann_id"];

		if (!(scene_id in organized)) {
			organized[scene_id] = new Object();
		}

		if (!(object_id in organized[scene_id])) {
			organized[scene_id][object_id] = new Object();
		}

		if (!(ann_id in organized[scene_id][object_id])) {
			organized[scene_id][object_id][ann_id] = null;
		}

		organized[scene_id][object_id][ann_id] = data[i];
	}

	return organized
}

function append_head(message) {
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
	let head = "["+date_time+"]     ";

	return head+message;
}

// const scanrefer_data = organize_data(JSON.parse(fs.readFileSync("static/data/ScanRefer_filtered.json")))

/*************************************/
/********     Main Routes     ********/
/*************************************/

router.get("/main", function(req, res) {
	res.render("Main", {
		params: JSON.stringify({
			scene_list: scene_list
		})
	});
});

router.get("/error", function(req, res) {
	res.render("ErrorPage");
});

router.post("/login", function(req, res) {
	let username = req.body.username;
	let password = req.body.password;
	let status = password == credential[username];
	let response = {"status": status};
	console.log(append_head("login request from: "+username+", login status: "+status));
	res.json(response);
});

/*************************************/
/*********  Resource Routes  *********/
/*************************************/

router.get("/resource/refresh", function(req, res) {
	let routed = path.join(__dirname, "static", "refresh.ico");
	res.sendFile(routed);
});

router.get("/resource/camera", function(req, res) {
	let routed = path.join(__dirname, "static", "camera.ply");
	res.sendFile(routed);
});

router.get("/resource/mesh/:scene_id/:scene_mesh", function(req, res) {
	let routed = path.join(__dirname, scannet.scans, req.params.scene_id, req.params.scene_mesh);
	res.sendFile(routed);
});

router.get("/resource/object/:scene_id/:object_mesh", function(req, res) {
	let routed = path.join(__dirname, scannet.objects, req.params.scene_id, req.params.object_mesh);
	res.sendFile(routed);
});

router.get("/resource/aggr/:scene_id/:seg_aggr", function(req, res) {
	let routed = path.join(__dirname, scannet.scans, req.params.scene_id, req.params.seg_aggr);
	res.sendFile(routed);
});

router.get("/resource/seg/:scene_id/:seg_file", function(req, res) {
	let routed = path.join(__dirname, scannet.scans, req.params.scene_id, req.params.seg_file);
	res.sendFile(routed);
});

// individual pose file
router.get("/resource/pose/:scene_id/:pose_file", function(req, res) {
	let routed = path.join(__dirname, scannet.frames, req.params.scene_id, "pose", req.params.pose_file);
	res.sendFile(routed);
	console.log('Succesfully!')
});

// aggregated pose file
router.get("/resource/pose/:scene_id", function(req, res) {
	let routed = path.join(__dirname, scannet.frames, req.params.scene_id, "all_pose.json");
	res.sendFile(routed);
	console.log('Succesfully!')
});

router.get("/resource/frame/:scene_id/:frame_file", function(req, res) {
	let routed = path.join(__dirname, scannet.frames, req.params.scene_id, "color", req.params.frame_file);
	res.sendFile(routed);
	console.log('Succesfully!')
});

router.get("/resource/frame/reduced/:scene_id/:frame_file", function(req, res) {
	let routed = path.join(__dirname, scannet.frames, req.params.scene_id, "reduced", req.params.frame_file);
	res.sendFile(routed);
	console.log('Succesfully!')
});

router.get("/resource/preview/:scene_id", function(req, res) {
	let routed = path.join(__dirname, scannet.previews, req.params.scene_id + "_vh_clean_2.png");
	res.sendFile(routed);
	console.log('Succesfully!')
});

router.get("/resource/gallery/:scene_id", function(req, res) {
	let routed = path.join(__dirname, scannet.galleries, req.params.scene_id + ".json");
	res.sendFile(routed);
	console.log('Succesfully!')
});

router.get("/resource/instruction/:name", function(req, res) {
	let routed = path.join(__dirname, "static/instruction", req.params.name);
	res.sendFile(routed);
});

router.get("/resource/info/:name", function(req, res) {
	let routed = path.join(__dirname, "static/instruction", req.params.name);
	res.sendFile(routed);
});

/*************************************/
/*********  MeshViewer Routes  *********/
/*************************************/
router.post("/database/phrasegrounding/labeling", function(req, res) {
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		console.assert(!err, "failed to connect MongoDB client");
		const db = client.db(DB_NAME);
		const pg_collection = db.collection("demo");
		let async_tasks = [];
		async_tasks.push(function(callback) {
			var data = {
					"scene_id": req.body.scene_id,
					"object_id": req.body.object_id,
					"object_name": req.body.object_name,
					"ann_id": req.body.ann_id,
					"description": req.body.description,
					"position": req.body.position,
					"labeled_id": req.body.labeled_id,
					"labeled_phrase": req.body.labeled_phrase,
					"is_sure": req.body.is_sure
			};
			console.log(data)
			pg_collection.insertOne(
				data, function (err, result) {
					if (err) {
						return "Falied to insert!"
					}
					res.send(result);
					callback();
				}
			);
		});
		async.parallel(async_tasks, function(err, results){
			client.close();
			if (!err) {
				console.log("Insert Succesfully!")
			}
			else {
				console.log("Insert Failed!");
			}
		});
	});
});

router.post("/database/phrasegrounding/delete", function(req, res) {
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		console.assert(!err, "failed to connect MongoDB client");
		const db = client.db(DB_NAME);
		const pg_collection = db.collection("demo");
		let async_tasks = [];
		async_tasks.push(function(callback) {
			var data = {
					"object_id": req.body.object_id,
					"object_name": req.body.object_name,
					"ann_id": req.body.ann_id,
					"labeled_phrase": req.body.labeled_phrase
			};
			if (data.object_name === 'null') {
				data.object_name = null;
			}
			if (data.labeled_phrase === 'null') {
				data.labeled_phrase = null;
			}

			pg_collection.deleteOne(
				data, function (err, result) {
					if (err) {
						return "Falied to insert!"
					}
					callback();
				}
			);
		});
		async.parallel(async_tasks, function(err, results){
			client.close();
			if (!err) {
				console.log("Delete Succesfully!")
			}
			else {
				console.log("Delete Failed!");
			}
		});
	});
});

router.get("/database/phrasegrounding/review/:scene_id/:object_id/:anno_id", function(req, res) {
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		console.assert(!err, "failed to connect MongoDB client");
		const db = client.db(DB_NAME);
		const pg_collection = db.collection("demo");
		let async_tasks = [];
		async_tasks.push(function(callback) {
			
			if (req.params.object_id == '-1' && req.params.anno_id == '-1') {
				let query = {"scene_id": req.params.scene_id}	
				pg_collection.find(query).toArray(function(err, results) {
					res.json(results);
				});
			} else {
				let cur_scene_id = req.params.scene_id
				let cur_object_id = req.params.object_id
				let cur_anno_id = req.params.anno_id
				let query = {"scene_id": cur_scene_id,"object_id": cur_object_id,"ann_id": cur_anno_id};
				pg_collection.find(query).toArray(function(err, results) {
					res.json(results);
				});
			}

		});
		async.parallel(async_tasks, function(err, results){
			client.close();
			if (!err) {
				console.log("Check Succesfully!")
			}
			else {
				console.log("Check Failed!");
			}
		});
	});
});

router.get("/database/phrasegrounding/highlight/:scene_id/:object_id", function(req, res) {
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		console.assert(!err, "failed to connect MongoDB client");

		const db = client.db(DB_NAME);
		const pg_collection = db.collection("MeshSelect");
		let async_tasks = [];


		async_tasks.push(function(callback) {

			let cur_scene_id = req.params.scene_id
			let cur_object_id = req.params.object_id

			let query = {
					"scene_id": cur_scene_id,
					"object_id": cur_object_id,
			};

			pg_collection.find(query).toArray(function(err, results) {
				console.log(query)	
				console.log(results)	
				res.json(results);
			});
		});
		async.parallel(async_tasks, function(err, results){
			client.close();
			if (!err) {
				console.log("Check Succesfully!")
			}
			else {
				console.log("Check Failed!");
			}
		});
	});
});

router.get("/database/phrasegrounding/hasLabeled/:scene_id/:object_id", function(req, res) {
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		console.assert(!err, "failed to connect MongoDB client");
		const db = client.db(DB_NAME);
		const pg_collection = db.collection("demo");
		let async_tasks = [];
		async_tasks.push(function(callback) {

			let cur_scene_id = req.params.scene_id
			let cur_object_id = req.params.object_id

			let query = {
					"scene_id": cur_scene_id,
					"object_id": cur_object_id,
			};
			pg_collection.find(query).toArray(function(err, results) {
				let labeled_anno = new Array();
				for(var i = 0; i < results.length; i++) {
					var curr_anno = results[i].ann_id;
					if (curr_anno in labeled_anno) {
						labeled_anno[curr_anno] += 1
					} else {
						labeled_anno[curr_anno] = 0
					}
				}
				let has_labeled = Object.keys(labeled_anno).length;
				res.json({"has_labeled":Object.keys(labeled_anno), 'has_labeled_length':has_labeled});
			});
		});
		async.parallel(async_tasks, function(err, results){
			client.close();
			if (!err) {
				console.log("Check Succesfully!")
			}
			else {
				console.log("Check Failed!");
			}
		});
	});
});

router.get("/meshviewer/:extra", function(req, res) {
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		try {
			console.assert(!err, "failed to connect MongoDB client");
			const db = client.db(DB_NAME);
			const select_collection = db.collection("MeshSelect");
			let extra = new url.URLSearchParams(req.params.extra);
			let username = extra.get("username")
			let scene_id = extra.get("scene_id");

			let async_tasks = [];
			let query = {scene_id: scene_id};
			let scene_object = [];

			let pose_files = fs.readdirSync(path.join(scannet.frames, scene_id, "pose"));
			let scene_frame = [];
			for (let i = 0; i < pose_files.length; i++) {
				let frame_id = pose_files[i].split(".")[0];
				scene_frame.push(frame_id);
			}

			async_tasks.push(function(callback) {
				select_collection.find(query).toArray(function(err, results) {
					console.assert(!err, "failed to acquire data");
					for (let i = 0; i < results.length; i++) {
						scene_object.push(results[i].object_id+"_"+results[i].object_name.split(" ").join("_")+".ply");
					}
					scene_object.sort(function(a, b) {
						let x = parseInt(a.split("_")[0]);
						let y = parseInt(b.split("_")[0]);
						return x - y;
					});
					callback();
				});
			});
			async.parallel(async_tasks, function(err, results) {
				client.close();
				if (!err) {
					console.log(append_head("succeeded to query "+scene_object.length+" object selections in "+req.params.scene_id));
					console.log(append_head("Start rendering " + scene_id + " with " + pose_files.length + " frames and " + scene_object.length + " objects"));
					res.render("MeshViewer", {
						params: JSON.stringify({
							scene_id: scene_id,
							scene_object: scene_object,
							scene_frame: scene_frame,
							scannet: scannet,
							username: username
						})
					});
				}
				else {
					console.log(append_head("failed to query "+return_data.data.length+" object selections in "+req.params.scene_id));
					res.sendStatus(503);
				}
			});
		}
		catch (err) {
			console.log(err);
			console.log(append_head("Invalid request, redirecting to error page..."));
			res.render("ErrorPage");
		}
	});
});

/*************************************/
/*********  Database Routes  *********/
/*********      Mesh2cap     *********/
/*************************************/

// client connection check
router.get("/database/test", function(req, res) {
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		if (!err) {
			console.log(append_head("MongoDB client connected!"));
			client.close();
			res.sendStatus(200);
		}
		else {
			console.log(err);
			console.log(append_head("failed to connect MongoDB client"));
			res.sendStatus(503);
		}
	});
});

// client connection check
router.get("/database/mesh2cap/test/", function(req, res) {
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		if (!err) {
			console.log(append_head("MongoDB client connected!"));
			const db = client.db(DB_NAME);
			const des_collection = db.collection("nr3d");
			let query = {
				_id: 0
			}
			des_collection.find(query).toArray(function(err, results) {
				console.assert(!err, "failed to acquire data");
			});
			client.close();
			res.sendStatus(200);
		}
		else {
			console.log(append_head("failed to connect MongoDB client"));
			res.sendStatus(503);
		}
	});
});

// save mesh2cap descriptions
router.post("/database/mesh2cap/save", function(req, res) {
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		console.assert(!err, "failed to connect MongoDB client");
		const db = client.db(DB_NAME);
		const des_collection = db.collection("nr3d");
		let async_tasks = [];
		async_tasks.push(function(callback) {
			let query = {
				scene_id: req.body.scene_id,
				object_id: req.body.object_id,
				anno_id: req.body.anno_id,
			};
			des_collection.updateOne(
				query,
				{
					$set: {
						scene_id: req.body.scene_id,
						object_id: req.body.object_id,
						anno_id: req.body.anno_id,
						object_name: req.body.object_name,
						camera: req.body.camera,
						description: req.body.description,
						status: req.body.status,
						annotate: {
							assignment_id: req.body.annotate.assignment_id,
							hit_id: req.body.annotate.hit_id,
							worker_id: req.body.annotate.worker_id
						},
						verify: {
							assignment_id: req.body.verify.assignment_id,
							hit_id: req.body.verify.hit_id,
							worker_id: req.body.verify.worker_id,
							selected_in_view: req.body.verify.selected_in_view,
							selected_in_scene: req.body.verify.selected_in_scene,
							comment: req.body.verify.comment,
							reworded: req.body.verify.reworded
						}
					}
				},
				{
					upsert: true
				}, function(err, result) {
					console.assert(!err, "failed to update data");
					// console.log(err);
					callback();
				}
			);
		});
		async.parallel(async_tasks, function(err, results){
			client.close();
			if (!err) {
				console.log(append_head("succeeded to save annotation No."+req.body.anno_id+" of object No."+req.body.object_id+" in "+req.body.scene_id));
				res.sendStatus(200);
			}
			else {
				console.log(append_head("failed to save annotation No."+req.body.anno_id+" of object No."+req.body.object_id+" in "+req.body.scene_id));
				res.sendStatus(503);
			}
		});
	});
});

// reset mesh2cap verification
router.get("/database/mesh2cap/reset/:scene_id/:object_id/:anno_id", function(req, res) {
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		console.assert(!err, "failed to connect MongoDB client");
		const db = client.db(DB_NAME);
		const des_collection = db.collection("nr3d");
		let async_tasks = [];
		let query;
		async_tasks.push(function(callback) {
			if (req.params.scene_id == "-1") {
				query = {};
			}
			else {
				if (req.params.object_id == "-1") {
					query = {scene_id: req.params.scene_id};
				}
				else {
					if (req.params.anno_id == "-1") {
						query = {scene_id: req.params.scene_id, object_id: req.params.object_id};
					}
					else {
						query = {scene_id: req.params.scene_id, object_id: req.params.object_id, anno_id: req.params.anno_id};
					}
				}
			}
			des_collection.updateMany(
				query,
				{
					$set: {
						status: "unverified",
						verify: {
							assignment_id: null,
							hit_id: null,
							worker_id: null,
							selected_in_view: null,
							selected_in_scene: null,
							comment: null,
							reworded: null
						}
					}
				},
				{
					upsert: true
				}, function(err, result) {
					console.assert(!err, "failed to update data");
					// console.log(err);
					callback();
				}
			);
		});
		async.parallel(async_tasks, function(err, results){
			client.close();
			if (!err) {
				console.log(append_head("succeeded to reset annotation No."+req.body.anno_id+" of object No."+req.body.object_id+" in "+req.body.scene_id));
				res.sendStatus(200);
			}
			else {
				console.log(append_head("failed to reset annotation No."+req.body.anno_id+" of object No."+req.body.object_id+" in "+req.body.scene_id));
				res.sendStatus(503);
			}
		});
	});
});

// query annotation of mesh2cap descriptions
router.get("/database/mesh2cap/query/:scene_id/:object_id/:anno_id", function(req, res) {
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		console.assert(!err, "failed to connect MongoDB client");
		const db = client.db(DB_NAME);
		const des_collection = db.collection("nr3d");
		let async_tasks = [];
		let query;
		if (req.params.scene_id == "-1") {
			query = {};
		}
		else {
			if (req.params.object_id == "-1") {
				query = {scene_id: req.params.scene_id};
			}
			else {
				if (req.params.anno_id == "-1") {
					query = {scene_id: req.params.scene_id, object_id: req.params.object_id};
				}
				else {
					query = {scene_id: req.params.scene_id, object_id: req.params.object_id, anno_id: req.params.anno_id};
				}
			}
		}
		let return_data = {
			data: []
		};
		async_tasks.push(function(callback) {
			des_collection.find(query).toArray(function(err, results) {
				console.assert(!err, "failed to acquire data");
				for (let i = 0; i < results.length; i++) {
					try {
						return_data.data.push({
							scene_id: results[i].scene_id,
							object_id: results[i].object_id,
							anno_id: results[i].anno_id,
							object_name: results[i].object_name,
							camera: results[i].camera,
							description: results[i].description,
							status: results[i].status,
							annotate: {
								assignment_id: results[i].annotate.assignment_id,
								hit_id: results[i].annotate.hit_id,
								worker_id: results[i].annotate.worker_id
							},
							verify: {
								assignment_id: results[i].verify.assignment_id,
								hit_id: results[i].verify.hit_id,
								worker_id: results[i].verify.worker_id,
								selected_in_view: results[i].verify.selected_in_view,
								selected_in_scene: results[i].verify.selected_in_scene,
								comment: results[i].verify.comment,
								reworded: results[i].verify.reworded
							}
						});
					}
					catch (err) {
						console.log(err);
						return_data.data.push();
					}
				}
				callback();
			});
		});
		async.parallel(async_tasks, function(err, results) {
			client.close();
			if (!err) {
				console.log(append_head("succeeded to query "+return_data.data.length+" annotations of object No."+req.params.object_id+" in "+req.params.scene_id));
				res.json(return_data);
			}
			else {
				console.log(append_head("failed to query "+return_data.data.length+" annotations of object No."+req.params.object_id+" in "+req.params.scene_id));
				res.sendStatus(503);
			}
		});
	});
});

// delete annotation using specific scene_id and anno_id
// or delete all annotations of a scene_id
router.get("/database/mesh2cap/delete/:scene_id/:object_id/:anno_id", function(req, res) {
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		console.assert(!err, "failed to connect MongoDB client");
		const db = client.db(DB_NAME);
		const des_collection = db.collection("nr3d");
		let async_tasks = [];
		let query;
		if (req.params.scene_id == "-1") {
			query = {};
		}
		else {
			if (req.params.object_id == "-1") {
				query = {scene_id: req.params.scene_id};
			}
			else {
				if (req.params.anno_id == "-1") {
					query = {scene_id: req.params.scene_id, object_id: req.params.object_id};
				}
				else {
					query = {scene_id: req.params.scene_id, object_id: req.params.object_id, anno_id: req.params.anno_id};
				}
			}
		}
		async_tasks.push(function(callback) {
			des_collection.deleteMany(query, function(err, results) {
				console.assert(!err, "failed to delete anno_id "+req.params.anno_id+" of "+req.params.scene_id);
				callback();
			});
		});
		async.parallel(async_tasks, function(err, results) {
			client.close();
			if (!err) {
				console.log(append_head("succeeded to delete annotation No."+req.params.anno_id+" of object No."+req.params.object_id+" in "+req.params.scene_id));
				res.sendStatus(200);
			}
			else {
				console.log(append_head("failed to delete annotation No."+req.params.anno_id+" of object No."+req.params.object_id+" in "+req.params.scene_id));
				res.sendStatus(503);
			}
		});
	});
});


/*************************************/
/*********  Database Routes  *********/
/*********     MeshSelect    *********/
/*************************************/

// client connection check
router.get("/database/meshselect/test/", function(req, res) {
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		if (!err) {
			console.log(append_head("MongoDB client connected!"));
			const db = client.db(DB_NAME);
			const select_collection = db.collection("MeshSelect");
			let query = {
				_id: 0
			}
			select_collection.find(query).toArray(function(err, results) {
				console.assert(!err, "failed to acquire data");
			});
			client.close();
			res.sendStatus(200);
		}
		else {
			console.log(append_head("failed to connect MongoDB client"));
			res.sendStatus(503);
		}
	});
});

// save meshselect object selections
router.post("/database/meshselect/save", function(req, res) {
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		console.assert(!err, "failed to connect MongoDB client");
		const db = client.db(DB_NAME);
		const select_collection = db.collection("MeshSelect");
		let async_tasks = [];
		async_tasks.push(function(callback) {
			let query = {
				scene_id: req.body.scene_id,
				object_id: req.body.object_id
			};
			select_collection.updateOne(
				query,
				{
					$set: {
						scene_id: req.body.scene_id,
						object_id: req.body.object_id,
						object_name: req.body.object_name
					}
				},
				{
					upsert: true
				}, function(err, result) {
					console.assert(!err, "failed to update data");
					// console.log(err);
					callback();
				}
			);
		});
		async.parallel(async_tasks, function(err, results){
			client.close();
			if (!err) {
				console.log(append_head("succeeded to save selection for object No."+req.body.object_id+" "+req.body.object_name+" in "+req.body.scene_id));
				res.sendStatus(200);
			}
			else {
				console.log(append_head("failed to save selection for object No."+req.body.object_id+" "+req.body.object_name+" in "+req.body.scene_id));
				res.sendStatus(503);
			}
		});
	});
});

// query meshselect object selections
router.get("/database/meshselect/query/:scene_id", function(req, res) {
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		console.assert(!err, "failed to connect MongoDB client");
		const db = client.db(DB_NAME);
		const select_collection = db.collection("MeshSelect");
		let async_tasks = [];
		let query;
		if (req.params.scene_id == "-1") {
			query = {};
		}
		else {
			query = {scene_id: req.params.scene_id};
		}
		let return_data = {
			data: []
		};
		async_tasks.push(function(callback) {
			select_collection.find(query).toArray(function(err, results) {
				console.assert(!err, "failed to acquire data");
				for (let i = 0; i < results.length; i++) {
					return_data.data.push({
						scene_id: results[i].scene_id,
						object_id: results[i].object_id,
						object_name: results[i].object_name
					});
				}
				callback();
			});
		});
		async.parallel(async_tasks, function(err, results) {
			client.close();
			if (!err) {
				console.log(append_head("succeeded to query "+return_data.data.length+" object selections in "+req.params.scene_id));
				res.json(return_data);
			}
			else {
				console.log(append_head("failed to query "+return_data.data.length+" object selections in "+req.params.scene_id));
				res.sendStatus(503);
			}
		});
	});
});

// delete object selections using specific scene_id and object_id
// or delete all selections of a scene_id
router.get("/database/meshselect/delete/:scene_id/:object_id", function(req, res) {
	MongoClient.connect(DB_URL, { useNewUrlParser: true }, function(err, client) {
		console.assert(!err, "failed to connect MongoDB client");
		const db = client.db(DB_NAME);
		const select_collection = db.collection("MeshSelect");
		let async_tasks = [];
		let query;
		if (req.params.scene_id == "-1") {
			query = {};
		}
		else {
			if (req.params.object_id == "-1") {
				query = {scene_id: req.params.scene_id};
			}
			else {
				query = {scene_id: req.params.scene_id, object_id: req.params.object_id};
			}
		}
		async_tasks.push(function(callback) {
			select_collection.deleteMany(query, function(err, results) {
				console.assert(!err, "failed to delete object selections of object No."+req.params.object_id+" in "+req.params.scene_id);
				callback();
			});
		});
		async.parallel(async_tasks, function(err, results) {
			client.close();
			if (!err) {
				console.log(append_head("succeeded to delete object selections of object No."+req.params.object_id+" in "+req.params.scene_id));
				res.sendStatus(200);
			}
			else {
				console.log(append_head("failed to delete object selections of object No."+req.params.object_id+" in "+req.params.scene_id));
				res.sendStatus(503);
			}
		});
	});
});

/*************************************/
/********  MeshSelect Routes  ********/
/*************************************/

// route from main
router.get("/meshselect/:scene_id", function(req, res) {
	try {
		let scene_id = req.params.scene_id;
		let object_files_raw = fs.readdirSync(path.join(scannet.objects, scene_id))
		// let object_files = new Array(object_files_raw.length);
		let object_files = new Object();
		for (let i = 0; i < object_files_raw.length; i++) {
			let object_id = parseInt(object_files_raw[i].split(".")[0].split("_")[0]);
			object_files[object_id] = object_files_raw[i];
		}
		let scene_object = [];
		// for (let i = 0; i < object_files.length; i++) {
		// 	scene_object.push(object_files[i]);
		// }
		let object_ids = Object.keys(object_files);
		for (let i = 0; i < object_ids.length; i++) {
			scene_object.push(object_files[object_ids[i]])
		}
		let pose_files = fs.readdirSync(path.join(scannet.frames, scene_id, "pose"));
		let scene_frame = [];
		for (let i = 0; i < pose_files.length; i++) {
			let frame_id = pose_files[i].split(".")[0];
			scene_frame.push(frame_id);
		}
		console.log(append_head("Start rendering " + scene_id + " with " + pose_files.length + " frames and " + scene_object.length + " objects"));
		res.render("MeshSelect", {
			params: JSON.stringify({
				scene_id: scene_id,
				scene_object: scene_object,
				scene_frame: scene_frame,
				scannet: scannet
			})
		});
	}
	catch (err) {
		console.log(append_head("Invalid request, redirecting to error page..."));
		res.render("ErrorPage");
	}
});

/*************************************/
/*********   Start Service   *********/
/*************************************/


app.use(config.base_url, router);
module.exports = router;

let async0 = new Promise((resolve, reject) => {
	resolve();
});


Promise.all([async0]).then(res => {
	const server = http.createServer(app).listen(config.http_port, function() {
	// const opt = {
	//	key: fs.readFileSync("cert/char.vc.in.tum.de.key"),
	//	cert: fs.readFileSync("cert/char.vc.in.tum.de.cert")
	// };
	// const server = https.createServer(opt, app).listen(config.http_port, function() {
		// const host = server.address().address;
		const host = '0.0.0.0'
		const port = server.address().port;
		console.log("Example app listening at address http://%s in port: %s", host, port);
		// console.log("Example app listening at address https://%s in port: %s", host, port);
	});
});
