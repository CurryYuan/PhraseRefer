import React from "react";

class ViewUI extends React.Component {
    constructor(props) {
        super(props);
        this.status_palette = {
            verified: "rgb(66, 139, 202)",
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
        //         <button id={"focus_"+this.props.object_id+"_"+this.props.anno_id} className="btn btn-success" style={{"display": "inline", "width": "41%", "marginLeft": "6%", "marginRight": "6%"}}>Focus</button>
        //         <button id={"submit_"+this.props.object_id+"_"+this.props.anno_id} className="btn btn-primary" style={{"display": "inline", "width": "41%"}}>Submit</button>
        //     </div>
		// </div>
        
        <React.Fragment>
            <td style={{"width": "6%", "height": "100%", "display": "inline-block"}}>
                <div style={{"fontSize": "16px"}}>{this.props.object_id}</div>
            </td>
            <td style={{"width": "6%", "height": "100%", "display": "inline-block"}}>
                <div style={{"fontSize": "16px"}}>{this.props.anno_id}</div>
            </td>
            <td style={{"width": "8%", "height": "100%", "display": "inline-block"}}>
                <div id={"status_"+this.props.object_id+"_"+this.props.object_name+"_"+this.props.anno_id} style={{"fontSize": "16px", "color": this.status_palette[this.props.status]}}>{this.props.status}</div>
            </td>
            <td style={{"width": "60%", "height": "100%", "display": "inline-block"}}>
                <div id={"description_"+this.props.object_id+"_"+this.props.object_name+"_"+this.props.anno_id} style={{"fontSize": "16px"}}>{this.props.description}</div>
            </td>
            <td style={{"width": "20%", "height": "100%", "display": "inline-block"}}>
                <button id={"view_"+this.props.object_id+"_"+this.props.object_name+"_"+this.props.anno_id} className="btn btn-warning" style={{"display": "inline", "width": "28%", "marginLeft": "4%", "marginRight": "2%"}}>Focus</button>
                <button id={"scene_"+this.props.object_id+"_"+this.props.object_name+"_"+this.props.anno_id} className="btn btn-success" style={{"display": "inline", "width": "28%", "marginLeft": "2%", "marginRight": "4%"}}>Scene</button>
                <button id={"submit_"+this.props.object_id+"_"+this.props.object_name+"_"+this.props.anno_id} className="btn btn-primary" style={{"display": "inline", "width": "28%"}}>Submit</button>
            </td>
        </React.Fragment>
        );
    }

}





export default ViewUI;
