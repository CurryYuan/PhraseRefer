import React from "react";

class InstructionHelper extends React.Component {
    constructor(props) {
        super(props);

        // resources
        this.example = "/apps/resource/instruction/annotate.gif";
        this.good_1 = "/apps/resource/instruction/good_1.png";
        this.good_2 = "/apps/resource/instruction/good_2.png";
        this.bad_1 = "/apps/resource/instruction/bad_1.png";
    }

    render() {
        return (
            <div>
                <h1>Instructions</h1>
                <p style={{"fontSize": "22px"}}>
                    <mark style={{"backgroundColor": "yellow"}}>Please read through this before you start. For a better annotation performance, we recommend to use Google Chrome.</mark>
                </p>
                <p style={{"fontSize": "18px"}}>
                    <strong>You will see 5 highlighted 3D objects in different indoor scenes. Please describe the objects in at least two sentences from the current view point, <span style={{"color": "red"}}>so that the objects can be uniquely identified in the scene based on your descriptions and how you looked at them at submission time.</span></strong>
                </p>
                <p style={{"fontSize": "18px"}}>
                    Some of the information below should be included in your description:
                </p>
                <ul>
                    <li style={{"fontSize": "18px"}}>The <strong style={{"color": "red"}}>appearance</strong> of the object, e.g. <strong>colors, shapes, materials, etc.</strong></li>
                    <li style={{"fontSize": "18px"}}>The <strong style={{"color": "red"}}>location</strong> of that object in the scene, e.g. <strong>"the chair is in the center of this room"</strong></li>
                    <li style={{"fontSize": "18px"}}>The <strong style={{"color": "red"}}>spatial relation</strong> between this object and other objects, e.g. <strong>"this chair is the second one from the left"</strong></li>
                </ul>
                <p style={{"fontSize": "18px"}}>
                    <i>Imagine you and your friend are both in a room, and you would like to ask your friend to find you something in that room. Since there might be a lot of similar objects, <strong>you should make your description about the target object as unique as possible.</strong></i>
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
                    <li style={{"fontSize": "18px", "fontWeight": "bold"}}>rotate/move/zoom the scene to the view point where you could better see and describe the target object</li>
                    <li style={{"fontSize": "18px"}}>enable/disable highlighting to see/hide the whole scene</li>
                    <li style={{"fontSize": "18px"}}>Refer to the object image gallery on the top right for a clearer view</li>
                    <li style={{"fontSize": "18px"}}>Write down your description</li>
                    <li style={{"fontSize": "18px", "fontWeight": "bold", "color": "red"}}>Double check if the description matches the final view point after you stop moving the scene</li>
                    <li style={{"fontSize": "18px"}}>Click <label style={{"color": "#428bca"}}>Next</label> to go to the next one or click <label style={{"color": "#428bca"}}>Submit</label> to finish the task</li>
                </ul>
                <h2>
                    Some good descriptions:
                </h2>
                
                <center>
                <p>
                    <img src={this.good_1} style={{"width": "900px", "height": "430px"}} />
                    <label style={{"fontSize": "18px"}}><strong>this is a sofa which is shaped like the uppercase letter "L". it is placed in front of the television in the corner of this room.</strong></label>
                </p>
                </center>
                
                <center>
                <p>
                    <img src={this.good_2} style={{"width": "900px", "height": "430px"}} />
                    <label style={{"fontSize": "18px"}}><strong>there is a dark blue couch on the right side of the living room. it cannot be missed if someone walks into this room through its front door.</strong></label>
                </p>
                </center>
                
                <h2>
                    Some bad descriptions:
                </h2>
                <p style={{"fontSize": "18px"}}>
                    <mark style={{"backgroundColor": "yellow"}}>Please note that you won’t be paid if you describe the objects in this way</mark>
                </p>
                
                <center>
                <p>
                    <img src={this.bad_1} style={{"width": "900px", "height": "430px"}} /><br/>
                    <label style={{"fontSize": "18px"}}><strong>it is a red furry thing. <label style={{"color": "red"}}>(wrong information)</label></strong></label>
                </p>
                </center>
                
                <center>
                <p>
                    <img src={this.bad_1} style={{"width": "900px", "height": "430px"}} /><br/>
                    <label style={{"fontSize": "18px"}}><strong>i don't know what it is. <label style={{"color": "red"}}>(useless information)</label></strong></label>
                </p>
                </center>

                <center>
                <p style={{"fontSize": "18px", "marginTop": "10px"}}>
                    <span style={{"color": "red", "fontWeight": "bold"}}>Please keep in mind that your description must match the view point when you submit the results.</span> 
                </p>
                </center>
            </div>
        );
    }

}

export default InstructionHelper;