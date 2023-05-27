import React from "react";

class RootUI extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id="root_container" style={{"position": "absolute", "width": "100%", "height": "90%", "marginTop": "100px", "marginLeft": "10%", "marginRight": "15%"}}>
                <div id="content_container" style={{"position": "absolute", "width": "80%", "height": "100%", "left": "0"}}>
                    <div id="control_container" style={{"position": "absolute", "width": "90%", "height": "90%", "marginLeft": "5%", "boxShadow": "5px 5px 20px 20px #ccc", "borderRadius": "8px", "overflow": "auto", "zIndex": "1000", "backgroundColor": "white", "display": "none"}}>
                        <div style={{"position": "absolute", "width": "90%", "height": "95%", "marginTop": "50px", "marginLeft": "5%"}}>
                            <div id="control_content"></div>
                            <center><button id="close_control" type="button" className="btn btn-primary" style={{"width": "100px", "fontSize": "18px", "marginTop": "20px", "marginBottom": "50px"}}>Close</button></center>
                        </div>
                    </div>
                    <div id="info_container" style={{"position": "absolute", "width": "90%", "height": "90%", "marginLeft": "5%", "boxShadow": "5px 5px 20px 20px #ccc", "borderRadius": "8px", "overflow": "auto", "zIndex": "1000", "backgroundColor": "white", "display": "none"}}>
                        <div style={{"position": "absolute", "width": "90%", "height": "95%", "marginTop": "50px", "marginLeft": "5%"}}>
                            <div id="info_content"></div>
                            <center><button id="close_info" type="button" className="btn btn-primary" style={{"width": "100px", "fontSize": "18px", "marginTop": "20px", "marginBottom": "50px"}}>Close</button></center>
                        </div>
                    </div>
                    <div id="view_container">
                        <button type="button" id="btn_none" className="btn btn-outline-primary">none</button>
                        <button type="button" id="btn_surface" className="btn btn-outline-primary">surface</button>
                        <button type="button" id="btn_screenshot" className="btn btn-outline-primary">screenshot</button>
                        <button type="button" id="btn_labeled_info" className="btn btn-outline-primary" style={{"color":"red", "fontSize": "18px", "marginLeft": "30px"}}>The selected Obj is: </button>
                        {/* <button type="button" id="btn_instance" className="btn btn-default">instance</button> */}
                    </div>
                    {/* <div>
                        <label id="label_ALL" className="btn btn-lg btn-default" style={{"textAlign": "left", "height": "45px", "width": "250px"}}>
                            <span style={{"float": "left"}}>ALL</span>
                        </label>
                    </div> */}

                    {/* center canvas container below */}
                    <div>
                        <div id="loading_container" style={{"position": "absolute", "width": "80%", "height": "70%", "float": "left", "display": "block"}}>
                            {/* <img src="../../../../images/Spinner-1s-200px.gif" style={{}}/> */}
                            <div id="loading_bar" style={{"position": "absolute", "width": "0%", "height": "10px", "backgroundColor": "#23639a", "transition": "width 0.2s"}}></div>
                        </div>
                        <div id="canvas_container" style={{"position": "absolute", "width": "80%", "height": "70%", "float": "left"}}>
                            <canvas id="canvas" style={{"width": "100%", "height": "100%"}}/>
                        </div>
                        {/* <div id="image_container" style={{"position": "absolute", "width": "20%", "height": "23%", "marginLeft": "60%", "float": "left", "display": "none"}}>
                            <img id="image" style={{"position": "absolute", "width":"100%", "height": "100%"}}/>
                            <div id="frame_loading_container" style={{"position": "absolute", "width":"100%", "height": "40%", "display": "block"}}>
                                <div id="frame_loading_bar" style={{"position": "absolute", "width": "0%", "height": "10px", "backgroundColor": "#23639a"}}></div>
                                <label style={{"position": "absolute", "color": "#23639a", "marginTop": "10px"}}>Loading gallery: <span id="frame_loading_progress"></span>%</label>
                            </div>
                        </div> */}
                        <div id="button_container" style={{"position": "absolute", "height": "70%", "marginLeft": "83%", "float": "left", "display": "none"}}>
                            <div style={{"position": "absolute"}}>
                                <label id="label_ALL" className="btn btn-lg btn-outline-secondary" style={{"textAlign": "left", "width": "320px"}}>
                                    <span style={{"float": "left"}}>ALL</span>
                                </label>
                            </div>
                            <div id="label_container" style={{"position": "absolute", "top": "50px", "height": "90%", "overflow": "auto"}}>
                                
                            </div>
                        </div>
                    </div>
                    {/* <div style={{"position": "absolute", "width": "100%", "height": "20%", "top": "75%", "overflow": "auto"}}>
                        <div>
                            <div style={{"width": "6%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>Obj.</label>
                            </div>
                            <div style={{"width": "6%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>Ann.</label>
                            </div>
                            <div style={{"width": "6%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>Status</label>
                            </div>
                            <div style={{"width": "8%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>AW.ID</label>
                            </div>
                            <div style={{"width": "8%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>VW.ID</label>
                            </div>
                            <div style={{"width": "46%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>Description</label>
                            </div>
                            <div style={{"width": "20%", "height": "35px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                <label style={{"color": "white", "fontSize": "16px", "marginTop": "5px", "marginLeft": "5px"}}>Operation</label>
                            </div>
                        </div>
                        <div id="ViewUI" style={{"height": "100%"}}>
                        </div>
                    </div> */}

                    {/* table container below */}
                    <div style={{"position": "absolute", "width": "100%", "height": "50%", "top": "75%", "overflow": "auto", "marginTop":"100px"}}>
                        <table className="table table-striped table-hover" style={{"width": "100%"}}>
                            <thead>
                                <tr>
                                    <th style={{"width": "10%", "height": "50px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                        <label style={{"color": "white", "fontSize": "16px", "marginLeft": "5px"}}>Obj.</label>
                                    </th>
                                    <th style={{"width": "10%", "height": "50px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                        <label style={{"color": "white", "fontSize": "16px", "marginLeft": "5px"}}>Ann.</label>
                                    </th>
                                    {/* <th style={{"width": "6%", "height": "50px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                        <label style={{"color": "white", "fontSize": "16px", "marginLeft": "5px"}}>Status</label>
                                    </th>
                                    <th style={{"width": "8%", "height": "50px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                        <label style={{"color": "white", "fontSize": "16px", "marginLeft": "5px"}}>AW.ID</label>
                                    </th>
                                    <th style={{"width": "8%", "height": "50px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                        <label style={{"color": "white", "fontSize": "16px", "marginLeft": "5px"}}>VW.ID</label>
                                    </th> */}
                                    <th style={{"width": "60%", "height": "50px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                        <label style={{"color": "white", "fontSize": "16px", "marginLeft": "5px"}}>Description</label>
                                    </th>
                                    <th style={{"width": "20%", "height": "50px", "display": "inline-block", "backgroundColor": "#23639a", "border": "1px solid white"}}>
                                        <label style={{"color": "white", "fontSize": "16px", "marginLeft": "5px"}}>Operation</label>
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="ViewUI"></tbody>
                        </table>
                    </div>
                </div>
                <div style={{"marginLeft":"300px"}}>
                <div id="form_container" style={{"position": "absolute", "width": "20%", "height": "50%", "right": "0", "zIndex":99}}></div>
                <div style={{"position": "absolute", "width": "20%", "height": "50%", "right": "0", "marginTop":"700px"}}>Check the labeled information:</div>
                <div id="check_container" style={{"position": "absolute", "width": "20%", "height": "50%", "right": "0", "marginTop":"740px", "overflow":"scroll"}}></div>
                <div id="label_txt" style={{"display": "none", "position": "absolute", "cursor": "pointer"}}>
                </div>
                </div>
            </div>
        );
    }

}


export default RootUI;
