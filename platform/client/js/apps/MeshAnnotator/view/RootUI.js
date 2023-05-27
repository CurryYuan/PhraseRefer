import React from "react";

class RootUI extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
		<div id="root_container" style={{"position": "absolute", "width": "80%", "height": "85%", "marginTop": "50px", "marginLeft": "10%", "marginRight": "15%"}}>
            <div id="content_container" style={{"position": "absolute", "width": "100%", "height": "100%"}}>
                <div id="start_container" style={{"position": "absolute", "width": "90%", "height": "90%", "marginLeft": "5%", "boxShadow": "5px 5px 20px 20px #ccc", "borderRadius": "8px", "overflow": "auto", "zIndex": "1000", "backgroundColor": "white", "display": "block"}}>
                    <div style={{"position": "absolute", "width": "90%", "height": "95%", "marginTop": "50px", "marginLeft": "5%"}}>
                    <div id="start_instruction_content"></div>
                    <div id="start_control_content"></div>
                    <center>
                        <p style={{"fontSize": "22px", "marginTop": "20px"}}>
                            <strong>Please be patient as the resources might take a few minutes to load. </strong> If you are ready, please click <label style={{"color": "#428bca"}}>Start</label>
                        </p>
                        <button id="submit_start" type="button" className="btn btn-primary" style={{"width": "100px", "fontSize": "18px", "marginBottom": "50px"}}>Start</button>
                    </center>
                    </div>
                </div>
                <div id="instruction_container" style={{"position": "absolute", "width": "90%", "height": "90%", "marginLeft": "5%", "boxShadow": "5px 5px 20px 20px #ccc", "borderRadius": "8px", "overflow": "auto", "zIndex": "1000", "backgroundColor": "white", "display": "none"}}>
                    <div style={{"position": "absolute", "width": "90%", "height": "95%", "marginTop": "50px", "marginLeft": "5%"}}>
                        <div id="instruction_content"></div>
                        <center><button id="close_instruction" type="button" className="btn btn-primary" style={{"width": "100px", "fontSize": "18px", "marginTop": "20px", "marginBottom": "50px"}}>Close</button></center>
                    </div>
                </div>
                <div id="control_container" style={{"position": "absolute", "width": "90%", "height": "90%", "marginLeft": "5%", "boxShadow": "5px 5px 20px 20px #ccc", "borderRadius": "8px", "overflow": "auto", "zIndex": "1000", "backgroundColor": "white", "display": "none"}}>
                    <div style={{"position": "absolute", "width": "90%", "height": "95%", "marginTop": "50px", "marginLeft": "5%"}}>
                        <div id="control_content"></div>
                        <center><button id="close_control" type="button" className="btn btn-primary" style={{"width": "100px", "fontSize": "18px", "marginTop": "20px", "marginBottom": "50px"}}>Close</button></center>
                    </div>
                </div>
                <div id="view_container">
                    <button type="button" id="btn_none" className="btn btn-outline-secondary" style={{"display": "none"}}>none</button>
                    <button type="button" id="btn_surface" className="btn btn-outline-secondary" style={{"display": "none"}}>surface</button>
                    {/* <button type="button" id="btn_instance" className="btn btn-default">instance</button> */}
                </div>
                <div>
                    <div id="loading_container" style={{"position": "absolute", "width": "75%", "height": "70%", "float": "left", "display": "block"}}>
                        {/* <img src="../../../../images/Spinner-1s-200px.gif" style={{}}/> */}
                        <div id="loading_bar" style={{"position": "absolute", "width": "0%", "height": "10px", "backgroundColor": "#23639a", "transition": "width 0.2s"}}></div>
                        <label id="loading_status" style={{"position": "absolute", "color": "#23639a", "marginTop": "10px"}}></label>
                    </div>
                    <div id="canvas_container" style={{"position": "absolute", "width": "75%", "height": "70%", "float": "left", "display": "block"}}>
                        <canvas id="canvas" style={{"width": "100%", "height": "100%"}}/>
                    </div>
                </div>
                <div id="image_container" style={{"position": "absolute", "width": "25%", "height": "70%", "marginLeft": "76%", "float": "left", "display": "none"}}>
                    <span style={{"position": "absolute", "fontSize": "22px", "fontWeight": "bold", "backgroundColor": "white", "zIndex": "999"}}>Image gallery for the target object</span>
                    <img id="image" style={{"position": "absolute", "top": "5%", "width":"100%", "height": "40%"}}/>
                    <div id="frame_loading_container" style={{"position": "absolute", "top": "5%", "width":"100%", "height": "40%", "display": "block"}}>
                        <div id="frame_loading_bar" style={{"position": "absolute", "width": "0%", "height": "10px", "backgroundColor": "#23639a"}}></div>
                        <label style={{"position": "absolute", "color": "#23639a", "marginTop": "10px"}}>Loading gallery: <span id="frame_loading_progress"></span>%</label>
                    </div>
                    <span style={{"position": "absolute", "fontSize": "16px", "fontWeight": "bold", "top": "45%"}}>(Rotate the scene and the image above changes accordingly)</span>
                    <div style={{"position": "absolute", "fontSize": "16px", "top": "55%"}}>
                        <p>
                            <mark style={{"backgroundColor": "yellow"}}>Annotating steps:</mark>
                        </p>
                        <ul>
                            <li style={{"fontWeight": "bold"}}>Rotate/move/zoom the scene to the view point where you could better see and describe the target object</li>
                            <li style={{"fontWeight": "bold"}}>Press "C" to enable/disable highlighting to make sure the target object is <span style={{"color": "red"}}>visible and not occluded</span> from the current view</li>
                            <li>Refer to the object image gallery above for a clearer view</li>
                            <li>Write down your description</li>
                            <li style={{"fontWeight": "bold"}}>Before you submit, <span style={{"color": "red"}}>double check if your description matches the final view point (not the initial view point)</span></li>
                            <li>Click <label style={{"fontWeight": "bold", "color": "#428bca"}}>Next</label> to go to the next one or click <label style={{"fontWeight": "bold", "color": "#428bca"}}>Submit</label> to finish the task</li>
                        </ul>
                        <p>
                            If you're still not clear about this task or the interface controls, please click <span style={{"fontWeight": "bold", "color": "#17a2b8"}}>Instructions</span> or <span style={{"fontWeight": "bold", "color": "#17a2b8"}}>Control</span> on the top right.
                        </p>
                    </div>
                </div>
            </div>
            <div id="form_container" style={{"position": "absolute", "width": "75%", "height": "20%", "top": "72%"}}>
                <form>
                    <div className="form-group"  style={{"position": "absolute", "width": "100%"}}>
                        <div>
                            <strong style={{"fontSize": "18px"}}>Page <span id="page_id"></span> / <span id="batch_size"></span></strong><br/>
                            <strong style={{"fontSize": "18px"}}>Please put your description for the highlighted <span id="object_name" style={{"color": "red"}}></span> in the scene here and make sure that (<mark style={{"backgroundColor": "yellow"}}>Your work might be rejected if any point below is violated</mark>):</strong>
                            <ul>
                                <li style={{"fontWeight": "bold"}}>You write <span style={{"color": "red"}}>at least two sentences</span> to describe the <u>appearance and spatial location</u> of the object</li>
                                <li style={{"fontWeight": "bold"}}>The target object can be <span style={{"color": "red"}}>uniquely identified among other similar objects</span> with your description, <i>e.g. by specifying "<u>the second chair from the left</u>"</i></li>
                                <li style={{"fontWeight": "bold"}}>Your final view point after you stop moving the scene is still <span style={{"color": "red"}}>inside this scene</span></li>
                                <li style={{"fontWeight": "bold"}}>The target object can be <span style={{"color": "red"}}>clearly seen</span> from the current view</li>
                                <li style={{"fontWeight": "bold"}}><span style={{"color": "red"}}>Your description matches the final view point (not the initial view point)</span></li>
                            </ul>
                            <input id="input_text" type="text" className="form-control" style={{"height": "40px", "fontSize": "18px"}}/>
                        </div>
                        <div style={{"position": "absolute", "width": "100%"}}>
                            <div style={{"width": "100%", "marginTop": "1%", "fontSize": "18px"}}>
                                <button id="submit_btn" type="button" className="btn btn-primary" style={{"width": "10%", "marginLeft": "90%", "fontSize": "18px"}}>Submit</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
		</div>
        );
    }

}





export default RootUI;
