import React from "react";
import * as path from "path";

class InfoContent extends React.Component {
    constructor(props) {
        super(props);

        // resources
        this.info_1 = "/apps/resource/instruction/info_1.png";
        this.info_2 = "/apps/resource/instruction/info_2.png";
    }

    render() {
        return (
        <div>
            <h1>Information</h1>
            <p style={{"fontSize": "22px"}}>
                Here are some instructions for labeling and verification.
            </p>
            <center>
                <img src={this.info_1} style={{"width": "960px", "height": "575px"}}/><br/>
                <label style={{"fontSize": "18px"}}><strong>If the target object is covered in the selections, it will be highlighed in <span style={{"color": "#218838"}}>green</span> and other ambiguous selections will be in <span style={{"color": "#ffc107"}}>yellow</span></strong></label>
            </center>
            <center>
                <img src={this.info_2} style={{"width": "960px", "height": "575px"}}/><br/>
                <label style={{"fontSize": "18px"}}><strong>If the target object is not covered, it will be in <span style={{"color": "#ff0000"}}>red</span> and other selections will still be in <span style={{"color": "#ffc107"}}>yellow</span></strong></label>
            </center>
        </div>
        );
    }

}

export default InfoContent;