import React from "react";

class ControlContent extends React.Component {
    constructor(props) {
        super(props);

        // resources
        this.rotate = "/apps/resource/instruction/rotate.gif";
        this.move = "/apps/resource/instruction/move.gif";
        this.zoom = "/apps/resource/instruction/zoom.gif";
        this.highlight = "/apps/resource/instruction/highlight.gif";

        this.label_1 = "/apps/resource/instruction/scene_figure.png";
        this.label_2 = "/apps/resource/instruction/label_2.png";
        this.label_3 = "/apps/resource/instruction/label_3.png";
        this.label_4 = "/apps/resource/instruction/label_4.png";
        this.label_5 = "/apps/resource/instruction/label_5.png";

        this.check_1 = "/apps/resource/instruction/check_instructions.png";
        this.check_2 = "/apps/resource/instruction/check_2.png";
        this.check_3 = "/apps/resource/instruction/check_3.png";
        this.check_4 = "/apps/resource/instruction/check_4.png";
    }


    render() {
        return (
        <div>
            <center>
                <h1>Instructions</h1>
                <p style={{"fontSize": "20px", "marginTop": "20px", "background-color":"yellow"}}>
                    Below are some necessary instructions for the labeling and verification. 
                </p>
            <h2>Labeling</h2>
            </center>
                <center>
                    <img class="ins_image" src={this.label_1} style={{"width": "70%"}}/><br/>
                    <label style={{"fontSize": "18px"}}><strong>1. Press the <span style={{"color": "red"}}>"C"</span> in keyboard and then you will see all the objects which need labeling on the screen.</strong></label>
                </center>
                
                <center>
                    <img class="ins_image" src={this.label_2} style={{"width": "70%"}}/><br/>
                    <label style={{"fontSize": "18px"}}><strong>2. Select <span style={{"color": "red"}}>one object from the middle-right drop-down box</span> and its surface color will be changed to light green distinguished from other objects in the scene. Besides, the related information would be presented in the right table.</strong></label>
                </center>
                    
                <center>
                    <img class="ins_image" src={this.label_5} style={{"width": "70%"}}/><br/>
                    <label style={{"fontSize": "18px"}}><strong>3. Click the <span style={{"color": "red"}}>"label"</span> button in the bottom table and the you will enter the labeling process.</strong></label>
                </center>
                    
                <center>
                    <img class="ins_image" src={this.label_3} style={{"width": "70%"}}/><br/>
                    <label style={{"fontSize": "18px"}}><strong>4. Select the <span style={{"color": "red"}}>"phrase"</span> from the "description" by your left mouse button button and move your mouse cursor to the corresponding object in the scene. Finally, press the "Control" key and click your left mouse button at the same time to finish label.</strong></label>
                </center>
                    
                <center>
                    <img class="ins_image" src={this.label_4} style={{"width": "70%"}}/><br/>
                    <label style={{"fontSize": "18px"}}><strong>5. You can check your labeled information from <span style={{"color": "red"}}>the right table</span> on the screen and click <span style={{"color": "red"}}>"Sure and Save"</span> or <span style={{"color": "red"}}>"Not Sure and Save"</span> button to save the record.</strong></label>
                </center>
                <br/><br/><br/><br/><br/>

                <center><h2>Verification</h2></center>
            
                <center>
                    <label style={{"fontSize": "18px"}}><strong>1. Do the same process as "Step 1" and "Step 2" in "Labeling"</strong></label>
                </center>
                
                <center>
                    <img class="ins_image" src={this.check_1} style={{"width": "70%"}}/><br/>
                    <label style={{"fontSize": "18px"}}><strong>2. Click the <span style={{"color": "red"}}>"Check"</span> button in the bottom table and the you will enter the verification process.</strong></label>
                </center>
                    
                <center>
                    <img class="ins_image" src={this.check_2} style={{"width": "70%"}}/><br/>
                    <label style={{"fontSize": "18px"}}><strong>3. You will see the labeled information related the the corresponding object from <span style={{"color": "red"}}>the left right table</span></strong></label>
                    </center>
                    
                <center>
                    <img class="ins_image" src={this.check_3} style={{"width": "70%"}}/><br/>
                    <label style={{"fontSize": "18px"}}><strong>4. Clcik the <span style={{"color": "red"}}>"highlight"</span>button and you will see the labeled object in the scene, where its surface color would be changed to <span style={{"color": "red"}}>another color</span>.</strong></label>
                </center>
                    
                <center>
                    <img class="ins_image" src={this.check_4} style={{"width": "70%"}}/><br/>
                    <label style={{"fontSize": "18px"}}><strong>5. Besides, you can judge the rightness of labeld information by checking whether <span style={{"color": "red"}}>"label_phrase"</span> equals to <span style={{"color": "red"}}>"index_phrase"</span>. If not, then click the <span style={{"color": "red"}}>"delete"</span> button and relabel the data.</strong></label>
                </center>
        </div>
        );
    }

}

export default ControlContent;