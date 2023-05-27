import React from "react";

class ViewUI extends React.Component {
    constructor(props) {
        super(props);
        this.status_palette = {
            verified: "rgb(92, 193, 61)",
            unverified: "rgb(240, 173, 78)",
        }
    }

    render() {
        return (
		// <div style={{"width": "100%", "height": "35px"}}>
        //     <div style={{"width": "6%", "height": "100%", "backgroundColor": this.props.bg, "border": "1px solid white", "display": "inline-block"}}>
        //         <div style={{"height": "1em", "marginTop": "5px", "marginLeft": "5px", "fontSize": "16px"}}>{this.props.object_id}</div>
        //     </div>
        //     <div style={{"width": "6%", "height": "100%", "backgroundColor": this.props.bg, "border": "1px solid white", "display": "inline-block"}}>
        //         <div style={{"height": "1em", "marginTop": "5px", "marginLeft": "5px", "fontSize": "16px"}}>{this.props.anno_id}</div>
        //     </div>
        //     <div style={{"width": "8%", "height": "100%", "backgroundColor": this.props.bg, "border": "1px solid white", "display": "inline-block"}}>
        //         <div id={"status_"+this.props.object_id+"_"+this.props.anno_id} style={{"height": "1em", "marginTop": "5px", "marginLeft": "5px", "fontSize": "16px", "color": this.status_palette[this.props.status]}}>{this.props.status}</div>
        //     </div>
        //     <div style={{"width": "65%", "height": "100%", "backgroundColor": this.props.bg, "border": "1px solid white", "display": "inline-block"}}>
        //         <div style={{"height": "1em", "marginTop": "5px", "marginLeft": "5px", "fontSize": "16px", "overflowX": "auto"}}>{this.props.description}</div>
        //     </div>
        //     <div style={{"width": "15%", "height": "100%", "backgroundColor": this.props.bg, "border": "1px solid white", "display": "inline-block"}}>
        //         <button id={"accept_"+this.props.object_id+"_"+this.props.anno_id} className="btn btn-success" style={{"display": "inline", "width": "41%", "marginLeft": "6%", "marginRight": "6%"}}>Accept</button>
        //         <button id={"reject_"+this.props.object_id+"_"+this.props.anno_id} className="btn btn-danger" style={{"display": "inline", "width": "41%"}}>Reject</button>
        //     </div>
        // </div>
        
        <React.Fragment>
            <td style={{"width": "10%", "height": "100%", "display": "inline-block"}}>
                <div style={{"fontSize": "16px"}}>{this.props.object_id}</div>
            </td>
            <td style={{"width": "10%", "height": "100%", "display": "inline-block"}}>
                <div style={{"fontSize": "16px"}}>{this.props.anno_id}</div>
            </td>
            <td style={{"width": "60%", "height": "100%", "display": "inline-block"}}>
                <div id={"description_"+this.props.object_id+"_"+this.props.anno_id} style={{"fontSize": "16px"}}>{this.props.description}</div>
            </td>
            <td style={{"width": "20%", "height": "100%", "display": "inline-block"}}>
                {/* <button id={"view_"+this.props.object_id+"_"+this.props.anno_id} className="btn btn-warning" style={{"display": "inline", "width": "30%", "marginLeft": "2.5%"}}>Focus</button> */}
                <button id={"scene_"+this.props.object_id+"_"+this.props.anno_id} className="btn btn-success" style={{"display": "inline", "width": "40%", "marginLeft": "5%"}}>Scene</button>
                <button id={"label_"+this.props.object_id+"_"+this.props.anno_id} className="btn btn-success" style={{"display": "inline", "width": "40%", "marginLeft": "5%"}}>Label</button>
                <button id={"check_"+this.props.object_id+"_"+this.props.anno_id} className="btn btn-warning" style={{"display": "inline", "width": "40%", "marginLeft": "5%"}}>Check</button>
                <button id={"isLabel_"+this.props.object_id+"_"+this.props.anno_id} className="btn btn-warning" style={{"display": "inline", "width": "40%", "marginLeft": "5%"}}>Not Labeled</button>
                
                {/* <a id={"comment_"+this.props.object_id+"_"+this.props.anno_id} tabIndex="0" className="btn btn-info" role="button" style={{"display": "inline-block", "width": "32%", "marginLeft": "4%"}}  data-trigger="focus" data-toggle="popover" data-placement="top" data-content="">Comments</a> */}
            </td>
        </React.Fragment>
        );
    }

}





export default ViewUI;