import React from 'react';
import ReactDOM from 'react-dom';
import RootUI from './view/RootUI';
import ViewUI from "./view/ViewUI";
import FootUI from "./view/FootUI";
import * as path from "path";
import * as Math from "mathjs";
import { promises, stat } from 'fs';

class Main {
    
    /********************************************
     *************       init       *************
     ********************************************/    
    init (params) {
        // init params
        this.init_params(params);
        this.init_scene_chunks();
        
        // render
        this.render_root_ui();
    }

    init_params(params) {
        this.scene_list = params.scene_list;
    }

    init_scene_chunks() {
        this.set_scene_chunks(this.scene_list);
    }

    /********************************************
     *************      render      *************
     ********************************************/

    render_root_ui() {
        ReactDOM.render(<RootUI/>, document.getElementById("root_ui"), function() {
            // get all relevant elements after rendering the root_ui
            this.get_root_elements();
            this.get_window_parameters();
            // this.get_login();

            // render elements
            this.render_scene_select();
            this.render_view_ui(this.scene_chunks[0]);
            this.render_foot_ui();
        }.bind(this));
    }

    render_scene_select() {
        let all_scenes = ["Select a scene"];
        let scene_list = all_scenes.concat(this.scene_list);
        for (let i = 0; i < scene_list.length; i++) {
            let option = document.createElement("option");
            option.value = scene_list[i];
            option.style.fontSize = "16px";
            option.innerHTML = scene_list[i];
            this.select.scene.appendChild(option);
        }
        // add listener
        this.add_listener(document.getElementById("submit_view"), "click", this.on_submit_view);
    }

    render_view_ui(scene_list) {
        let view_list_snippet = scene_list;
        // get view_ui
        let view_ui = document.getElementById("ViewUI");
        // remove 
        view_ui.parentNode.removeChild(view_ui)
        view_ui = document.createElement("div");
        view_ui.id = "ViewUI";
        this.content_container.appendChild(view_ui);
        for (let i = 0; i < view_list_snippet.length; i++) {
            // get view_ui
            let view_container = document.createElement("div");
            view_ui.appendChild(view_container)

            this.get_object_list(view_list_snippet[i]).then(object_list =>{
                ReactDOM.render(<ViewUI object_list={object_list} img_src={"/apps/resource/preview/" + view_list_snippet[i]}  scene_id={view_list_snippet[i]}/>, view_container, function() {
                    console.log("display " + view_list_snippet[i]);
                    this.get_view_elements(view_list_snippet[i]);
                    this.get_annotation_stats(view_list_snippet[i]).then(results => {
                        this.set_progress(view_list_snippet[i], results.stats, object_list.length - 1);
                        // this.set_unambiguity(view_list_snippet[i], results.unambiguity);
                    });
                    
                    
                    this.add_listener(this.button["submit_view_"+view_list_snippet[i]], "click", this.on_click_view, view_list_snippet[i]);
                }.bind(this));
            });
        }
    }

    render_foot_ui() {
        ReactDOM.render(<FootUI num_chunk={this.scene_chunks.length}/>, document.getElementById("FootUI"), function() {
            // add listeners
            this.input_page = document.getElementById("input_page_number");
            this.button.first_page = document.getElementById("btn_page_first");
            this.button.prev_page = document.getElementById("btn_page_prev");
            this.button.next_page = document.getElementById("btn_page_next");
            this.button.last_page = document.getElementById("btn_page_last");
            this.button.go_page = document.getElementById("btn_page_go");

            this.add_listener(this.input_page, "keyup", this.on_keyup_enter_page, window.event);
            this.add_listener(this.button.first_page, "click", this.on_click_first_page);
            this.add_listener(this.button.prev_page, "click", this.on_click_prev_page);
            this.add_listener(this.button.next_page, "click", this.on_click_next_page);
            this.add_listener(this.button.last_page, "click", this.on_click_last_page);
            this.add_listener(this.button.go_page, "click", this.on_click_go_page);
        }.bind(this));
    }

    /********************************************
     *************       utils      *************
     ********************************************/

    get_window_parameters() {
        this.window_width = document.documentElement.clientWidth;
        this.window_height = document.documentElement.clientHeight;
    }

    get_root_elements() {
        // containers
        this.navbar = document.getElementById("navbar");
        this.select_container = document.getElementById("select_container");
        this.root_container = document.getElementById("root_container");
        this.content_container = document.getElementById("content_container");
        this.foot_container = document.getElementById("foot_container");

        // select menus
        this.select = new Object();
        this.select.scene = document.getElementById("scene_select");
        this.select.filter = document.getElementById("filter_select");

        // buttons
        this.button = new Object;
        this.button.submit_select = document.getElementById("submit_select");

        // progress
        this.progress = new Object();
    }

    get_view_elements(scene_id) {
        // select menus
        this.select["select_object_"+scene_id] = document.getElementById("select_object_"+scene_id);
        
        // buttons
        this.button["submit_delete_"+scene_id] = document.getElementById("submit_delete_"+scene_id);
        this.button["submit_verify_"+scene_id] = document.getElementById("submit_verify_"+scene_id);
        this.button["submit_view_"+scene_id] = document.getElementById("submit_view_"+scene_id);
        this.button["submit_choose_"+scene_id] = document.getElementById("submit_choose_"+scene_id);
        this.button["submit_annotate_"+scene_id] = document.getElementById("submit_annotate_"+scene_id);

        // progress
        this.progress["progress_"+scene_id] = document.getElementById("progress_"+scene_id);
        this.progress["selected_"+scene_id] = document.getElementById("selected_"+scene_id);
        this.progress["verified_"+scene_id] = document.getElementById("verified_"+scene_id);
        this.progress["unverified_"+scene_id] = document.getElementById("unverified_"+scene_id);
        this.progress["refresh_"+scene_id] = document.getElementById("refresh_"+scene_id);
    }

    get_object_list(scene_id) {
        return new Promise((resolve, reject) => {
            window.xhr_json("GET", path.join("/apps/database/meshselect/query", scene_id)).then(results => {
                let data = results.data;
                let object_list = new Array();
                for (let i = 0; i < data.length; i++) {
                    object_list.push(data[i]["object_id"] + " " +data[i]["object_name"]);
                }
                object_list.sort(function(a, b) {
                    let x = parseInt(a.split(" ")[0]);
                    let y = parseInt(b.split(" ")[0]);
                    return x - y;
                });
                resolve(["Select an object"].concat(object_list));
            })
        })
    }

    get_annotation_stats(scene_id) {
        return new Promise((resolve, reject) => {
            window.xhr_json("GET", path.join("/apps/database/mesh2cap/query", scene_id, "-1", "-1")).then(annotations => {
                let data = annotations.data;
                let stats = {
                    verified: 0,
                    unverified: 0
                };
                let unambiguity = {
                    view: 0,
                    scene: 0
                }
                let modes = Object.keys(unambiguity)
                for (let i = 0; i < data.length; i++) {
                    stats[data[i]["status"]]++;
                    for (let j = 0; j < modes.length; j++) {
                        if (data[i] && data[i].verify["selected_in_{0}".format(modes[j])]) {
                            let target = data[i].object_id;
                            let selected = data[i].verify["selected_in_{0}".format(modes[j])].split(" ");
                            if (target == selected[0] && selected.length == 1) unambiguity[modes[j]]++
                        }
                    }
                }
                for (let j = 0; j < modes.length; j++) {
                    let ua;
                    if (stats.verified != 0) ua = unambiguity[modes[j]] / stats.verified;
                    else ua = 0
                    unambiguity[modes[j]] = (ua * 100).toFixed(2) + "%"
                }
                let results = {
                    stats: stats,
                    unambiguity: unambiguity
                }
                resolve(results);
            });
        });
    }

    labeled_unique (arr) {
        return Array.from(new Set(arr))
    }
      
    get_labeled_annotations(scene_id) {
        return new Promise((resolve, reject) => {
            window.xhr_json("GET", path.join("/apps//database/phrasegrounding/review/", scene_id, "-1", "-1")).then(results => {

                let ann_list = new Array()
                for (var i = 0; i < results.length; i++) {

                    let annotated_info = results[i].scene_id + '_' + results[i].object_id + '_' + results[i].ann_id
                    ann_list.push(annotated_info)
                }
                let count = this.labeled_unique(ann_list).length
                resolve(count);
            });
        })
    }

    get_scene_annotations(scene_id) {
        return new Promise((resolve, reject) => {
            window.xhr_json("GET", path.join("/apps/database/mesh2cap/query", scene_id, "-1", "-1")).then(results => {
                let num_results = results.data.length;
                let count = {
                    scene: scene_id,
                    annotated: 0,
                    verified: 0,
                    all: num_results
                };
                if (num_results > 0) {
                    for (let data_id = 0; data_id < results.data.length; data_id++) {
                        let data = results.data[data_id];
                        if (data.status == "unverified") {
                            count.annotated++;
                        }
                        else if (data.status == "accepted" || data.status == "rejected" || data.status == "ambiguous") {
                            count.verified++;
                        }
                        else {}
                    }
                }
                resolve(count);
            });
        })
    }

    set_filter_progress() {
        this.filter_progress.num_checked++;
        if (this.filter_progress.num_checked < this.filter_progress.num_total) {
            this.filter_progress.progress_bar.style.width = Math.floor(this.filter_progress.num_checked / this.filter_progress.num_total * 100) + "%";
        }
        else {
            this.filter_progress.progress_bar.style.display = "none";
        }
    }

    set_progress(scene_id, stats, num_object) {
        this.progress["selected_"+scene_id].innerHTML = num_object;
        this.set_progress_bar(scene_id, stats);
    }

    set_unambiguity(scene_id, unambiguity) {
        let keys = Object.keys(unambiguity);
        for (let i = 0; i < keys.length; i++) {
            let objective = document.getElementById("unambi_{0}_{1}".format(keys[i], scene_id))
            objective.innerHTML = unambiguity[keys[i]];
        }
    }

    set_progress_bar(scene_id, stats) {
        let palette = {
            verified: "rgb(92, 193, 61)",
            unverified: "rgb(240, 173, 78)",
        }

        let status = Object.keys(stats);
        let total = 0;
        for (let i = 0; i < status.length; i++) {
            total += stats[status[i]];
        }
        if (total != 0) {
            for (let i = 0; i < status.length; i++) {
                this.progress[status[i]+"_"+scene_id].style.display = "inline-block";
                this.progress[status[i]+"_"+scene_id].style.width = 100 * (stats[status[i]] / total) + "%";
                this.progress[status[i]+"_"+scene_id].style.textAlign = "center";
                if (stats[status[i]] != 0) {
                    let span = document.getElementById(status[i]+"_num_"+scene_id);
                    this.get_labeled_annotations(scene_id).then(results => {

                        let curr_selected_span = document.getElementById("verified_num_" + scene_id)
                        curr_selected_span.innerText = "Total Sentences:  " + stats[status[i]] + ". Has Labeled:  " +  results

                        if (stats[status[i]].toString() === results.toString()) {
                            this.progress[status[i]+"_"+scene_id].style.backgroundColor = "rgb(92, 193, 61)"
                        } else {
                            this.progress[status[i]+"_"+scene_id].style.backgroundColor = "rgb(240, 173, 78)"
                        }

                    })
                }
            }
        }
        else {
            this.progress["verified_"+scene_id].style.display = "inline-block";
            this.progress["verified_"+scene_id].style.width = "100%";
            this.progress["verified_"+scene_id].style.backgroundColor = "rgb(200, 200, 200)";
            this.progress["verified_"+scene_id].style.textAlign = "center";
            document.getElementById("verified_num_"+scene_id).innerHTML = 0;
        }
    }

    set_scene_chunks(scene_list, chunk_size=5) {
        this.scene_chunks = new Array();
        for (let offset = 0; offset < scene_list.length; offset += chunk_size) {
            this.scene_chunks.push(scene_list.slice(offset, offset + chunk_size));
        }
    }

    filter_scene_list(filter) {
        if (filter == "All") {
            // display all scenes
            this.set_scene_chunks(this.scene_list);
            this.render_view_ui(this.scene_chunks[0]);
        }
        else {
            let annotating_list = new Array();
            let verifying_list = new Array();
            let verified_list = new Array();
            this.filter_progress = new Object();
            this.filter_progress.num_checked = 0;
            this.filter_progress.num_total = this.scene_list.length;
            this.filter_progress.progress_bar = document.getElementById("filter_progress");
            // this.filter_progress.progress_bar.width = window.innerWidth
            this.filter_progress.progress_bar.style.display = "block";
            let promises = new Array();
            for (let i = 0; i < this.scene_list.length; i++) {
                promises.push(this.get_scene_annotations(this.scene_list[i]).then(function(count) {
                    this.set_filter_progress();
                    return count;
                }.bind(this)));
            }
            Promise.all(promises).then(counts => {
                for (let i = 0; i < counts.length; i++) {
                    let count = counts[i];
                    if (count.all == 0) {
                        annotating_list.push(count.scene);
                    }
                    else {
                        if (count.verified >= 0 && count.verified < count.all) {
                            verifying_list.push(count.scene);
                        }
                        else {
                            verified_list.push(count.scene);
                        }
                    }
                }
                // filter the scene via selected filter
                let filtered_list;
                switch (filter) {
                    case "Annotating":
                        filtered_list = annotating_list;
                        break;
                    case "Verifying":
                        filtered_list = verifying_list;
                        break;
                    case "Verified":
                        filtered_list = verified_list;
                        break;
                }
                // display filtered scenes
                this.set_scene_chunks(filtered_list);
                this.render_view_ui(this.scene_chunks[0]);
            });
        }
        
    }

    /********************************************
     *************      handler     *************
     ********************************************/

    add_listener(element, event, callback, argument=null) {
        this[callback.name+"_ref"] = callback.bind(this);
        if (argument) {
            element.addEventListener(event, this[callback.name+"_ref"](argument));
        }
        else {
            element.addEventListener(event, this[callback.name+"_ref"]);
        }
    }

    on_click_login() {
        let username = this.input_username.value;
        let password = this.input_password.value;

        if (username.length == 0) {
            this.login_error.innerHTML = "Please input your username";
        }
        else if (password.length == 0) {
            this.login_error.innerHTML = "Please input your password";
        }
        else {
            let query = new Object();
            query.username = username;
            query.password = password;
            window.xhr_post(JSON.stringify(query), path.join("/apps/login")).then(results => {
                let status = JSON.parse(results)["status"];
                if (status) {
                    this.username = username;
                    this.login_container.style.display = "none";
                    this.content_container.style.display = "block";
                    this.foot_container.style.display = "block";

                    // render elements
                    this.render_scene_select();
                    this.render_filter_select();
                    this.render_view_ui(this.scene_chunks[0]);
                    this.render_foot_ui();
                }
                else {
                    this.login_error.innerHTML = "Invalid username or password";
                }
            });
        }
    }

    on_submit_filter() {
        let selected_filter = this.select.filter.options[this.select.filter.selectedIndex].value;
        if (selected_filter == "Select a filter") {
            alert("Please select a filter");
        }
        else {
            this.filter_scene_list(selected_filter);
        }
    }

    on_submit_verify() {
        let selected_scene = this.select.scene.options[this.select.scene.selectedIndex].value;
        if (selected_scene == "Select a scene") {
            alert("Please select a scene");
        }
        else {
            window.open(path.join("/apps/meshverify", "username={0}&scene_id={1}".format(this.username, selected_scene)), "_blank");
        }
    }

    on_submit_select() {
        let selected_scene = this.select.scene.options[this.select.scene.selectedIndex].value;
        if (selected_scene == "Select a scene") {
            alert("Please select a scene");
        }
        else {
            window.open(path.join("/apps/meshselect", selected_scene), "_blank");
        }
    }

    on_submit_view() {
        let selected_scene = this.select.scene.options[this.select.scene.selectedIndex].value;
        if (selected_scene == "Select a scene") {
            alert("Please select a scene");
        }
        else {
            window.open(path.join("/apps/meshviewer", "username={0}&scene_id={1}".format(this.username, selected_scene)), "_blank");
        }
    }

    on_click_refresh(scene_id) {
        return function() {
            this.get_annotation_stats(scene_id).then(results => {
                this.set_progress_bar(scene_id, results.stats);
                // this.set_unambiguity(scene_id, results.unambiguity);
            });
        }.bind(this);
    }

    on_click_delete(scene_id) {
        // return function() {
        //     let answer = confirm("Do you want to delete the data in this scene?");
        //     if (answer) {
        //         let promises = [
        //             window.xhr("GET", path.join("/apps/database/meshselect/delete", scene_id, "-1")),
        //             window.xhr("GET", path.join("/apps/database/mesh2cap/delete", scene_id, "-1" , "-1"))
        //         ];
        //         Promise.all(promises).then(() => {
        //             browser.tabs.reload();
        //         });
        //     }
        // }.bind(this);
    }

    on_click_verify(scene_id) {
        return function() {
            window.open(path.join("/apps/meshverify", "username={0}&scene_id={1}".format(this.username, scene_id)), "_blank");
        }.bind(this);
    }

    on_click_select(scene_id) {
        return function() {
            window.open(path.join("/apps/meshselect", scene_id), "_blank");
        }.bind(this);
    }

    on_click_annotate(scene_id) {
        return function() {
            let selected_object = this.select["select_object_"+scene_id].options[this.select["select_object_"+scene_id].selectedIndex].value;
            if (selected_object == "Select an object") {
                alert("Please select an object to annotate");
            }
            else {
                let object_name = selected_object.split(" ").join("_");
                window.xhr_json("GET", path.join("/apps/database/mesh2cap/query", scene_id, selected_object.split(" ")[0], "-1")).then(results => {
                    let anno_id;
                    if (results.data.length > 0) {
                        let anno_list = new Array();
                        for (let i = 0; i < results.data.length; i++) {
                            anno_list.push(parseInt(results.data[i].anno_id));
                        }
                        anno_id = Math.max(...anno_list) + 1;
                    }
                    else {
                        anno_id = 0;
                    }
                    window.open(path.join("/apps/meshannotator", scene_id, object_name, anno_id.toString()), "_blank");
                });
            }
        }.bind(this);
    }

    on_keyup_enter_page(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            this.button.go_page.click();
        }
    }

    on_click_view(scene_id) {
        return function() {
            window.open(path.join("/apps/meshviewer", "username={0}&scene_id={1}".format(this.username, scene_id)), "_blank");
        }.bind(this);
    }

    on_click_first_page() {
        this.input_page.value = "1";
        this.render_view_ui(this.scene_chunks[0]);
    }

    on_click_prev_page() {
        let cur_page = parseInt(this.input_page.value);
        if (cur_page > 1) {
            this.input_page.value = cur_page - 1;
            this.render_view_ui(this.scene_chunks[this.input_page.value - 1]);
        }
    }

    on_click_next_page() {
        let cur_page = parseInt(this.input_page.value);
        if (cur_page < this.scene_chunks.length) {
            this.input_page.value = cur_page + 1;
            this.render_view_ui(this.scene_chunks[this.input_page.value - 1]);
        }
    }

    on_click_last_page() {
        this.input_page.value = this.scene_chunks.length;
        this.render_view_ui(this.scene_chunks[this.scene_chunks.length - 1]);
    }

    on_click_go_page() {
        let cur_page = parseInt(this.input_page.value);
        if (cur_page > this.scene_chunks) {
            alert("There are only {0} pages in total".format(this.scene_chunks.length));
        }
        else {
            this.render_view_ui(this.scene_chunks[cur_page - 1]);
        }
    }
}

window.Main = Main;
