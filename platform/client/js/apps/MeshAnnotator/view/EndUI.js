import React from "react";

class EndUI extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
        <div style={{"position": "relative", "width": "60%", "height": "400px", "marginTop": "300px", "marginLeft": "20%", "boxShadow": "5px 5px 10px 8px #ccc", "borderRadius": "8px"}}>
            <div style={{"position": "absolute", "width": "60%", "top": "150px", "left": "20%", "fontSize": "20px"}}>Thank you for finishing this task, here is your confirmation code: <strong>{this.props.batch_code}</strong></div>
        </div>
        );
    }

}

export default EndUI;