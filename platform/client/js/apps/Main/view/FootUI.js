import React from "react";

class FootUI extends React.Component {
    constructor(props) {
        super(props);
    }

    render_page_number() {
        return (
            <div>
                <input id="input_page_number" type="text" defaultValue="1" style={{"width": "50px", "height": "40px", "fontSize": "18px", "textAlign": "center"}}></input>
                <label style={{"width": "50px", "fontSize": "18px", "textAlign": "center", "fontWeight": "bold"}}>&frasl;</label>
                <label style={{"width": "50px", "fontSize": "18px", "textAlign": "center", "fontWeight": "bold"}}>{this.props.num_chunk}</label>
            </div>
        );
    }

    render() {
        return (
            <div style={{"display": "inline"}}>
                <div style={{"width": "50px", "height": "50px", "marginLeft": "10px", "marginRight": "10px", "display": "inline-block"}}>
                    <button id="btn_page_first" className="btn btn-default" style={{"width": "100%", "height": "100%", "fontSize": "18px", "textAlign": "center", "boxShadow": "rgb(204, 204, 204) 2px 2px 2px 3px", "borderRadius": "5px"}}>&lt;&lt;</button>
                </div>
                <div style={{"width": "50px", "height": "50px", "marginLeft": "10px", "marginRight": "10px", "display": "inline-block"}}>
                    <button id="btn_page_prev" className="btn btn-default" style={{"width": "100%", "height": "100%", "fontSize": "18px", "textAlign": "center", "boxShadow": "rgb(204, 204, 204) 2px 2px 2px 3px", "borderRadius": "5px"}}>&lt;</button>
                </div>
                <div style={{"width": "180px", "height": "50px", "marginTop": "2px", "marginLeft": "10px", "marginRight": "10px", "display": "inline-block"}}>
                    {this.render_page_number()}
                </div>
                <div style={{"width": "50px", "height": "50px", "marginLeft": "10px", "marginRight": "10px", "display": "inline-block"}}>
                    <button id="btn_page_next" className="btn btn-default" style={{"width": "100%", "height": "100%", "fontSize": "18px", "textAlign": "center", "boxShadow": "rgb(204, 204, 204) 2px 2px 2px 3px", "borderRadius": "5px"}}>&gt;</button>
                </div>
                <div style={{"width": "50px", "height": "50px", "marginLeft": "10px", "marginRight": "10px", "display": "inline-block"}}>
                    <button id="btn_page_last" className="btn btn-default" style={{"width": "100%", "height": "100%", "fontSize": "18px", "textAlign": "center", "boxShadow": "rgb(204, 204, 204) 2px 2px 2px 3px", "borderRadius": "5px"}}>&gt;&gt;</button>
                </div>
                <div style={{"width": "50px", "height": "50px", "marginLeft": "10px", "marginRight": "10px", "display": "inline-block"}}>
                    <button id="btn_page_go" className="btn btn-primary" style={{"width": "100%", "height": "100%", "fontSize": "18px", "textAlign": "center", "boxShadow": "2px 2px 2px 4px #ccc", "borderRadius": "5px"}}>Go</button>
                </div>
            </div>
        );
    }

}


export default FootUI;