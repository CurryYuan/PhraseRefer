import React from "react";

class ViewUI extends React.Component {
    constructor(props) {
        super(props);
        this.status_palette = {
            accepted: "rgb(92, 193, 61)",
            unverified: "rgb(188, 189, 34)",
            rejected: "rgb(214, 39, 40)",
        }
    }

    render() {
        return (
		<div style={{"width": "100%", "height": "35px"}}>
            <div style={{"width": "6%", "height": "100%", "backgroundColor": this.props.bg, "border": "1px solid white", "display": "inline-block"}}>
                <div style={{"height": "1em", "marginTop": "5px", "marginLeft": "5px", "fontSize": "16px"}}>{this.props.object_id}</div>
            </div>
            <div style={{"width": "6%", "height": "100%", "backgroundColor": this.props.bg, "border": "1px solid white", "display": "inline-block"}}>
                <div style={{"height": "1em", "marginTop": "5px", "marginLeft": "5px", "fontSize": "16px"}}>{this.props.anno_id}</div>
            </div>
            <div style={{"width": "8%", "height": "100%", "backgroundColor": this.props.bg, "border": "1px solid white", "display": "inline-block"}}>
                <div id={"status_"+this.props.object_id+"_"+this.props.anno_id} style={{"height": "1em", "marginTop": "5px", "marginLeft": "5px", "fontSize": "16px", "color": this.status_palette[this.props.status]}}>{this.props.status}</div>
            </div>
            <div style={{"width": "65%", "height": "100%", "backgroundColor": this.props.bg, "border": "1px solid white", "display": "inline-block"}}>
                <div style={{"height": "1em", "marginTop": "5px", "marginLeft": "5px", "fontSize": "16px", "overflowX": "auto"}}>{this.props.description}</div>
            </div>
            <div style={{"width": "15%", "height": "100%", "backgroundColor": this.props.bg, "border": "1px solid white", "display": "inline-block"}}>
                <button id={"accept_"+this.props.object_id+"_"+this.props.anno_id} className="btn btn-success" style={{"display": "inline", "width": "41%", "marginLeft": "6%", "marginRight": "6%"}}>Accept</button>
                <button id={"reject_"+this.props.object_id+"_"+this.props.anno_id} className="btn btn-danger" style={{"display": "inline", "width": "41%"}}>Reject</button>
            </div>
		</div>
        );
    }

}





export default ViewUI;