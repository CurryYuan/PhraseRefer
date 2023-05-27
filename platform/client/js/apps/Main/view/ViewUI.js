import React from "react";

class ViewUI extends React.Component {
    constructor(props) {
        super(props);
    }

    render_objects() {
        let objects = []
        this.props.object_list.forEach((element, idx) => {
            objects.push(<option style={{"fontSize": "16px"}} key={""+idx}>{element}</option>)
        });
        return objects;
    }

    render() {
        return (
		<div style={{"width": "100%", "height": "400px", "marginTop": "20px", "marginBottom": "30px", "boxShadow": "5px 5px 10px 8px #ccc", "borderRadius": "8px"}}>
            <div style={{"position": "absolute", "width": "300px", "height": "300px", "margin": "50px"}}>
                <img src={this.props.img_src} style={{"width": "100%", "height": "100%"}}/>
            </div>
            <div style={{"position": "absolute", "height": "300px", "marginTop": "50px", "marginLeft": "400px", "opacity": "0.5", "width": "2px", "backgroundColor": "#777", "borderRadius": "2px"}}>&nbsp;</div>
            <div id="detail_container" style={{"position": "absolute", "width": "42%", "height": "300px", "marginTop": "50px", "marginLeft": "450px"}}>
            {/* <div id="detail_container" style={{"position": "absolute", "width": "50%", "height": "300px", "marginTop": "50px", "marginLeft": "450px"}}> */}
                <div>
                    <label style={{"fontSize": "20px", "fontWeight": "bold"}}>Scene_id: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</label>
                    <label style={{"fontSize": "20px", "fontWeight": "bold"}}>{this.props.scene_id}</label>
                </div>
                <div style={{"marginTop": "25px"}}> 
                    <label style={{"fontSize": "20px", "fontWeight": "bold"}}>Progress: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</label>
                    <div id={"progress_"+this.props.scene_id} style={{"width": "70%", "height": "100%", "display": "inline-block"}}>
                    {/* <div id={"progress_"+this.props.scene_id} style={{"width": "80%", "height": "100%", "display": "inline-block"}}> */}
                        <div id={"verified_"+this.props.scene_id} style={{"height": "100%", "display": "none"}}><span id={"verified_num_"+this.props.scene_id} style={{"color": "black", "fontWeight": "bold"}}></span></div>
                        <div id={"unverified_"+this.props.scene_id} style={{"height": "100%", "display": "none"}}><span id={"unverified_num_"+this.props.scene_id} style={{"color": "black", "fontWeight": "bold"}}></span></div>
                    </div>
                    <label id={"selected_"+this.props.scene_id} style={{"display": "inline-block", "marginLeft": "10px", "fontWeight": "bold"}}></label>
                    <label> &nbsp;<button id={"refresh_"+this.props.scene_id} className="btn btn-default"><img src="/apps/resource/refresh" height="25px"/></button></label>
                </div>
                {/* <div>
                    <label style={{"fontSize": "20px", "fontWeight": "bold"}}>Unambiguity: &nbsp; &nbsp; &nbsp;</label>
                    <label style={{"fontSize": "20px", "fontWeight": "bold"}}>View: &nbsp; &nbsp; &nbsp;</label>
                    <label id={"unambi_view_"+this.props.scene_id} style={{"fontSize": "20px", "width": "100px"}}></label>
                    <label style={{"fontSize": "20px", "fontWeight": "bold"}}>Scene: &nbsp; &nbsp; &nbsp;</label>
                    <label id={"unambi_scene_"+this.props.scene_id} style={{"fontSize": "20px", "width": "100px"}}></label>
                </div> */}
                <div style={{"marginTop": "20px"}}> 
                    <label style={{"fontSize": "20px", "fontWeight": "bold"}}>Object: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</label>
                    <select id={"select_object_"+this.props.scene_id} className="form-control" style={{"width": "200px", "fontSize": "16px", "display": "inline"}}>{this.render_objects()}</select>
                </div>
                <div style={{"marginTop": "30px"}}> 
                    <label style={{"fontSize": "20px", "fontWeight": "bold"}}>Operation: &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</label>
                    <button id={"submit_view_"+this.props.scene_id} className="btn btn-success" style={{"fontSize": "16px", "display": "inline", "width": "150px"}}>View</button>
                </div>
            </div>
            {/* <div style={{"position": "absolute", "marginLeft": "35%", "marginTop": "320px", "width": "700px", "fontSize": "16px", "display": "inline"}}>  */}
            {/* <div style={{"position": "absolute", "marginLeft": "40%", "marginTop": "320px", "width": "700px", "fontSize": "16px", "display": "inline"}}>  */}
                {/* <button id={"submit_delete_"+this.props.scene_id} className="btn btn-danger" style={{"fontSize": "16px", "width": "100px", "display": "inline"}} disabled>Delete</button> */}
                {/* <button id={"submit_verify_"+this.props.scene_id} className="btn btn-warning" style={{"fontSize": "16px", "display": "inline", "width": "100px", "marginLeft": "30px"}} disabled>Verify</button>
                <button id={"submit_choose_"+this.props.scene_id} className="btn btn-primary" style={{"fontSize": "16px", "display": "inline", "width": "100px", "marginLeft": "30px"}} disabled>Select</button>
                <button id={"submit_annotate_"+this.props.scene_id} className="btn btn-primary" style={{"fontSize": "16px", "display": "inline", "width": "100px", "marginLeft": "30px"}} disabled>Annotate</button> */}
                {/* <button id={"submit_view_"+this.props.scene_id} className="btn btn-success" style={{"fontSize": "16px", "display": "inline", "width": "100px", "marginLeft": "30px"}}>View</button> */}
            {/* </div> */}
        </div>
        );
    }

}


export default ViewUI;
