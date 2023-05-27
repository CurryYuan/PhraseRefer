import React from "react";

class RootUI extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
        <div style={{"position": "relative", "width": "60%", "height": "400px", "marginTop": "300px", "marginLeft": "20%", "boxShadow": "5px 5px 10px 8px #ccc", "borderRadius": "8px"}}>
            <div style={{"position": "absolute", "width": "80%", "top": "150px", "left": "20%", "fontSize": "20px"}}>Ooops... Something wrong just happened. Please make sure you input the correct URL and refresh the page.</div>
        </div>
        );
    }

}

export default RootUI;