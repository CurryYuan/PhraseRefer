import React from "react";

class CommentContent extends React.Component {
    constructor(props) {
        super(props);
        this.status_palette = {
            verified: "rgb(66, 139, 202)",
            unverified: "rgb(240, 173, 78)",
        }
    }

    render() {
        return (
            <div style={{"width": "80%", "marginLeft": "10%", "marginTop": "100px"}}>
                <label style={{"fontSize": "18px"}}>Selected description:</label><br/>
                <label id="description_text" style={{"fontSize": "18px", "fontWeight": "bold"}}></label><br/>
                <label style={{"fontSize": "18px", "marginTop": "20px"}}>Please tell us your comments on this description</label>
                <input id="comment_text" type="text" className="form-control" style={{"height": "40px", "fontSize": "18px"}}/>
                <label style={{"fontSize": "18px", "marginTop": "20px"}}>What would you like to describe it?</label>
                <input id="reworded_text" type="text" className="form-control" style={{"height": "40px", "fontSize": "18px"}}/>
                <div style={{"width": "100%", "marginTop": "20px"}}>
                    <button id="submit_comment" type="button" className="btn btn-primary" style={{"width": "100px", "fontSize": "18px", "float": "right"}}>Save</button>
                    <button id="close_comment" type="button" className="btn btn-light" style={{"width": "100px", "marginRight": "10px", "fontSize": "18px", "float": "right"}}>Close</button>
                </div>
            </div>
        );
    }

}

export default CommentContent;