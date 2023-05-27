import React from "react";

class RootUI extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id="root_container" style={{"position": "absolute", "width": "70%", "height": "90%", "marginTop": "100px", "marginLeft": "15%", "marginRight": "15%"}}>
                <div id="content_container" style={{"position": "absolute", "width": "100%", "height": "100%"}}>
                    <div id="view_container">
                        <button type="button" id="btn_none" className="btn btn-outline-primary">none</button>
                        <button type="button" id="btn_surface" className="btn btn-outline-primary">surface</button>
                        <button type="button" id="btn_instance" className="btn btn-outline-primary">instance</button>
                    </div>
                    <div>
                        <div id="loading_container" style={{"position": "absolute", "width": "90%", "height": "80%", "float": "left", "display": "block"}}>
                            {/* <img src="../../../../images/Spinner-1s-200px.gif" style={{}}/> */}
                            <div id="loading_bar" style={{"position": "absolute", "width": "0%", "height": "10px", "backgroundColor": "#23639a", "transition": "width 0.2s"}}></div>
                            <label id="loading_status" style={{"position": "absolute", "color": "#23639a", "marginTop": "10px"}}></label>
                        </div>
                        <div id="canvas_container" style={{"position": "absolute", "width": "90%", "height": "80%", "float": "left"}}>
                            <canvas id="canvas" style={{"width": "100%", "height": "100%"}}/>
                        </div>
                        <div id="image_container" style={{"position": "absolute", "width": "30%", "height": "30%", "marginLeft": "60%", "float": "left", "display": "none"}}>
                            <img id="image" style={{"width":"100%", "height": "100%"}}/>
                        </div>
                        <div id="button_container" style={{"position": "absolute", "height": "80%", "marginLeft": "90%", "float": "left", "display": "none"}}>
                            {/* <label id="label_ALL" className="btn btn-lg btn-default" style={{"textAlign": "left", "height": "45px", "width": "250px"}}>
                                <span style={{"float": "left"}}>ALL</span>
                            </label> */}
                            <div id="label_container" style={{"height": "100%", "overflow": "auto", "float": "left"}}>
                            </div>
                            {/* <div id="list_container" className="overlay btn-group btn-group-vertical ui-draggable ui-draggable-handle" style={{"height": "100%", "overflow": "auto", "float": "left"}}>
                                <div id="label_container" className="btn-group btn-group-vertical">
                                </div>
                            </div> */}
                        </div>
                    </div>
                    {/* <div style={{"position": "absolute", "width": "90%", "height": "20%", "top": "75%"}}>
                        <div>
                            <div style={{"width": "6%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>Obj. ID</label>
                            </div>
                            <div style={{"width": "6%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>Ann. ID</label>
                            </div>
                            <div style={{"width": "8%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>Status</label>
                            </div>
                            <div style={{"width": "65%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>Description</label>
                            </div>
                            <div style={{"width": "15%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>Operation</label>
                            </div>
                        </div>
                        <div>
                            <div id="ViewUI" style={{"overflowY": "auto"}}>
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>
        );
    }

}





export default RootUI;
