import React from "react";

class StartUI extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
        <div style={{"position": "absolute", "width": "70%", "height": "85%", "marginTop": "50px", "marginLeft": "15%", "boxShadow": "5px 5px 10px 8px #ccc", "borderRadius": "8px", "overflow": "auto"}}>
            <div style={{"position": "absolute", "width": "90%", "height": "95%", "marginTop": "50px", "marginLeft": "5%"}}>
                <div id="instruction_content"></div>
                <div id="control_content"></div>
                <center>
                    <p style={{"fontSize": "22px", "marginTop": "20px"}}>
                        <strong>Please be patient as the resources might take a few minutes to load. </strong> If you are ready, please click <label style={{"color": "#428bca"}}>Start</label>
                    </p>
                    <button id="submit_start" type="button" className="btn btn-primary" style={{"width": "100px", "fontSize": "18px", "marginBottom": "50px"}}>Start</button>
                </center>
            </div>
            
        </div>
        );
    }

}

export default StartUI;