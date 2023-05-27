import React from "react";

class ControlContent extends React.Component {
    constructor(props) {
        super(props);

        // resources
        this.rotate = "/apps/resource/instruction/rotate.gif";
        this.move = "/apps/resource/instruction/move.gif";
        this.zoom = "/apps/resource/instruction/zoom.gif";
        this.highlight = "/apps/resource/instruction/highlight.gif";
    }

    render() {
        return (
        <div>
            <h2>Interface Control</h2>
            <p style={{"fontSize": "18px", "marginTop": "20px"}}>
                 Below are some necessary controls for the scenes. In some scenes, you may need to rotate/move/zoom the scene in order to view the objects clearly. 
            </p>
            <h3>Rotate</h3>
            <center>
                <img src={this.rotate} style={{"width": "960px", "height": "575px"}}/><br/>
                <label style={{"fontSize": "18px"}}><strong><span style={{"color": "red"}}>Right click</span> and drag the scene</strong></label>
            </center>
            <h3>Move</h3>
            <center>
                <img src={this.move} style={{"width": "960px", "height": "575px"}}/><br/>
                <label style={{"fontSize": "18px"}}><strong><span style={{"color": "red"}}>Middle click</span> and drag the scene</strong></label>
            </center>
            <h3>Zoom</h3>
            <center>
                <img src={this.zoom} style={{"width": "960px", "height": "575px"}}/><br/>
                <label style={{"fontSize": "18px"}}><strong>Hover the mouse on the scene and <span style={{"color": "red"}}>scroll the wheel</span></strong></label>
            </center>
            <h3>Highlight</h3>
            <center>
                <img src={this.highlight} style={{"width": "960px", "height": "575px"}}/><br/>
                <label style={{"fontSize": "18px"}}><strong>Hover the mouse on the scene and <span style={{"color": "red"}}>press "C"</span></strong></label>
            </center>
        </div>
        );
    }

}

export default ControlContent;