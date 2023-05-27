import React from "react";

class RootUI extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id="root_container" style={{"position": "absolute", "width": "80%", "height": "90%", "marginTop": "100px", "marginLeft": "10%", "marginRight": "15%"}}>
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
                    <div id="comment_container" style={{"position": "absolute", "width": "60%", "height": "500px", "marginTop": "300px", "marginLeft": "20%", "boxShadow": "5px 5px 20px 20px #ccc", "borderRadius": "8px", "backgroundColor": "white", "display": "none", "zIndex": "1000"}}>
                        <div id="comment_content"></div>
                    </div>
                    <div id="view_container">
                        {/* <button type="button" id="btn_none" className="btn btn-default">none</button>
                        <button type="button" id="btn_surface" className="btn btn-default">surface</button> */}
                        {/* <button type="button" id="btn_instance" className="btn btn-default">instance</button> */}
                    </div>
                    <div>
                        <div id="loading_container" style={{"position": "absolute", "width": "100%", "height": "70%", "float": "left", "display": "block"}}>
                            {/* <img src="../../../../images/Spinner-1s-200px.gif" style={{}}/> */}
                            <div id="loading_bar" style={{"position": "absolute", "width": "0%", "height": "10px", "backgroundColor": "#23639a", "transition": "width 0.2s"}}></div>
                            <label id="loading_status" style={{"position": "absolute", "color": "#23639a", "marginTop": "10px"}}></label>
                        </div>
                        <div id="canvas_container" style={{"position": "absolute", "width": "75%", "height": "70%", "float": "left", "display": "block"}}>
                            <canvas id="canvas" style={{"width": "100%", "height": "100%"}}/>
                        </div>
                    </div>
                    <div id="image_container" style={{"position": "absolute", "width": "25%", "height": "70%", "marginLeft": "76%", "float": "left", "display": "none"}}>
                        <span style={{"position": "absolute", "fontSize": "22px", "fontWeight": "bold", "backgroundColor": "white", "zIndex": "999"}}>Image gallery for the current view</span>
                        <img id="image" style={{"position": "absolute", "top": "5%", "width":"100%", "height": "40%"}}/>
                        <div id="frame_loading_container" style={{"position": "absolute", "top": "5%", "width":"100%", "height": "40%", "display": "block"}}>
                            <div id="frame_loading_bar" style={{"position": "absolute", "width": "0%", "height": "10px", "backgroundColor": "#23639a"}}></div>
                            <label style={{"position": "absolute", "color": "#23639a", "marginTop": "10px"}}>Loading gallery: <span id="frame_loading_progress"></span>%</label>
                        </div>
                        <span style={{"position": "absolute", "fontSize": "16px", "fontWeight": "bold", "top": "45%"}}>(Rotate the scene and the image above changes accordingly)</span>
                        <div style={{"position": "absolute", "fontSize": "16px", "top": "55%", "height": "45%", "overflow": "auto"}}>
                            <p>
                                <mark style={{"backgroundColor": "yellow"}}>Annotating steps:</mark>
                            </p>
                            <ul>
                                <li>Press <span style={{"fontWeight": "bold"}}>F</span> to start verification</li>
                                <li>Click <span style={{"fontWeight": "bold", "color": "#ffc107"}}>View</span> or press <span style={{"fontWeight": "bold", "color": "#ffc107"}}>V</span> to go to the recorded view</li>
                                <li style={{"fontWeight": "bold"}}>Select and left click the objects from the <span style={{"fontWeight": "bold", "color": "#ffc107"}}>view</span> that match the description</li>
                                <li>Click <span style={{"fontWeight": "bold", "color": "#218838"}}>Scene</span> or press <span style={{"fontWeight": "bold", "color": "#218838"}}>R</span> to go to the global view</li>
                                <li style={{"fontWeight": "bold"}}>Select and left click the objects from the <span style={{"fontWeight": "bold", "color": "#218838"}}>scene</span> that match the description. <span style={{"fontWeight": "bold", "color": "red"}}>Note that you are allowed to move the scene as you want</span></li>
                                <li style={{"fontWeight": "bold"}}>For the objects that are selected by mistake, simply click them again to cancel the selection</li>
                                <li><span style={{"fontWeight": "bold", "color": "#c8c8c8"}}>(optional)</span> Click the bolded description to write down your comments</li>
                                <li><span style={{"fontWeight": "bold", "color": "#c8c8c8"}}>(optional)</span> You can also write down your own descriptions for the target objects in the popped out box</li>
                                <li>Click <span style={{"fontWeight": "bold", "color": "#007bff"}}>Submit</span> or press <span style={{"fontWeight": "bold", "color": "#007bff"}}>S</span> to submit the result</li>
                            </ul>
                            <p>
                                If you're still not clear about this task or the interface controls, please click <span style={{"fontWeight": "bold", "color": "#17a2b8"}}>Instructions</span> or <span style={{"fontWeight": "bold", "color": "#17a2b8"}}>Control</span> on the top right.
                            </p>
                        </div>
                    </div>
                    <div style={{"position": "absolute", "top": "72%", "width": "100%", "height": "25%"}}>
                        <strong style={{"fontSize": "18px"}}>Page <span id="page_id"></span> / <span id="batch_size"></span></strong><br/>
                        <strong style={{"fontSize": "18px"}}>Please click <span style={{"color": "rgb(240, 173, 78)"}}>Focus</span> and choose an object from the scene, then click <span style={{"color": "rgb(66, 139, 202)"}}>Submit</span></strong>
                        <br/>
                        <div style={{"width": "100%", "height": "80%", "overflow": "auto"}}>

                            {/* <div>
                                <div style={{"width": "6%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                    <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>Obj.</label>
                                </div>
                                <div style={{"width": "6%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                    <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>Ann.</label>
                                </div>
                                <div style={{"width": "8%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                    <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>Status</label>
                                </div>
                                <div style={{"width": "60%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                    <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>Description</label>
                                </div>
                                <div style={{"width": "20%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                    <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>Operation</label>
                                </div>
                            </div>
                            <div id="ViewUI" style={{"height": "100%"}}> */}
                            <table className="table table-striped table-hover" style={{"width": "100%"}}>
                                <thead>
                                    <tr>
                                        <th style={{"width": "6%", "height": "50px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                            <div style={{"color": "white", "fontSize": "16px", "marginLeft": "5px"}}>Obj.</div>
                                        </th>
                                        <th style={{"width": "6%", "height": "50px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                            <div style={{"color": "white", "fontSize": "16px", "marginLeft": "5px"}}>Ann.</div>
                                        </th>
                                        <th style={{"width": "8%", "height": "50px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                            <div style={{"color": "white", "fontSize": "16px", "marginLeft": "5px"}}>Status</div>
                                        </th>
                                        <th style={{"width": "60%", "height": "50px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                            <div style={{"color": "white", "fontSize": "16px", "marginLeft": "5px"}}>Description</div>
                                        </th>
                                        <th style={{"width": "20%", "height": "50px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                            <div style={{"color": "white", "fontSize": "16px", "marginLeft": "5px"}}>Operation</div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody id="ViewUI"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}





export default RootUI;
