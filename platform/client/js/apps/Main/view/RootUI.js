import React from "react";

class RootUI extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id="root_container" style={{"width": "100%", "height": "100%"}}>
                <div id="content_container" style={{"width": "80%", "height": "90%", "marginLeft": "10%", "marginRight": "15%"}}>
                    <div id="ViewUI"></div>
                </div>
                <div id="foot_container" style={{"width": "70%", "height": "120px", "marginLeft": "15%", "marginRight": "15%", "marginTop": "20px"}}>
                    <div id="FootUI" style={{"textAlign": "center"}}></div>
                </div>
            </div>
        );
    }

}


export default RootUI;
