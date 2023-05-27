import React from "react";
import * as path from "path";

class StartUI extends React.Component {
    constructor(props) {
        super(props);

        // resources
        this.example = "/apps/resource/instruction/verify.gif";
    }

    render() {
        return (
        <div>
            <h1>Instructions</h1>
            <p style={{"fontSize": "22px"}}>
                <mark style={{"backgroundColor": "yellow"}}>Please read through this before you start.</mark>
            </p>
            <p style={{"fontSize": "18px"}}>
                <strong>You will see 5 descriptions for different objects in indoor scenes. <label style={{"color": "red"}}>Please choose the object that can best match the description from the scene.</label></strong>
            </p>
            <p style={{"fontSize": "18px"}}>
                <i>Imagine you and your friend are both in a room, and your friend would like to ask you to find something in that room. The description by your friend should be detailed enough for you to find the object in this room, <strong>so you should also be able to find an object that matches the description the best.</strong></i>
            </p>
            <center>
                <p>
                <img src={this.example} style={{"width": "960px", "height": "575px"}} />
                <label style={{"fontSize": "18px"}}><strong>Description: there is a brown wooden cabinet. it is placed above the white refrigerator in the kitchen.</strong></label>
                </p>
            </center>
            <p style={{"fontSize": "18px"}}>
                Here are some steps to proceed with this task:
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
        </div>
        );
    }

}

export default StartUI;