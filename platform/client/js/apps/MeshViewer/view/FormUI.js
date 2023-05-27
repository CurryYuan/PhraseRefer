import React from "react";

class FormUI extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <React.Fragment>
                <div style={{"paddingTop":"0px", "fontSize":"20px"}}><span>Has Labeled: <br></br></span><span>{this.props.sentences_length}</span></div>
                <div style={{"paddingTop":"30px"}}><span>scene_id: </span><span style={{"fontSize":"17px", "color":"red"}}>{this.props.scene_id}</span></div>
                <div style={{"paddingTop":"10px"}}><span>object_id: </span><span style={{"fontSize":"17px", "color":"red"}}>{this.props.object_id}</span></div>
                <div style={{"paddingTop":"10px"}}><span>ann_id: </span><span style={{"fontSize":"17px", "color":"red"}}>{this.props.ann_id}</span></div>
                <div style={{"paddingTop":"10px"}}><span>description: </span><span style={{"fontSize":"17px", "color":"red"}}>{this.props.description}</span></div>
                <div style={{"paddingTop":"10px"}}><span>position: </span><span style={{"fontSize":"17px", "color":"red"}}>{this.props.position}</span></div>
                <div style={{"paddingTop":"10px"}}><span>labeled_id: </span><span style={{"fontSize":"17px", "color":"red"}}>{this.props.labeled_id}</span></div>
                <div style={{"paddingTop":"10px"}}><span>labeled_name: </span><span style={{"fontSize":"17px", "color":"red"}}>{this.props.labeled_name}</span></div>
                <div style={{"paddingTop":"10px","zIndex":"99"}}><span>labeled_phrase: </span><span style={{"fontSize":"17px", "color":"red"}}>{this.props.labeled_phrase}</span></div>
                <div style={{"paddingTop":"10px"}}><button id="update_label">Sure and Save</button></div>
                <div style={{"paddingTop":"10px"}}><button id="update_label_not_sure">Not Sure and Save</button></div>
            </React.Fragment>
        );
    }
}

export default FormUI;

	// render_info(results_list) {
	// 	let info_container = document.getElementById("info_container");
	// 	console.log(results_list);
	// 	for (var i = 0; i < results_list.length; i++) {
	// 		let info_div = document.createElement("div");
	// 		info_div.style.width = "100%";
	// 		info_container.append(info_div);
	// 		ReactDOM.render(<InfoUI object_id={results_list[i].object_id} object_name={results_list[i].object_name} ann_id={results_list[i].ann_id} labeled_phrase={results_list[i].labeled_phrase} />, info_div, function() {
	// 			console.log("render info")
	// 		}.bind(this));
	// 	}
	// }