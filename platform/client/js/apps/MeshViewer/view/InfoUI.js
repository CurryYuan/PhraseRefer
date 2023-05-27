import React from "react";

class InfoUI extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let data = this.props.data;
        return (
            <div id="father_delete">
                {data.map((item, idx) => (
                    <div  id={"objID_"+item.object_id+"_objName_"+item.object_name+"_annId_"+item.ann_id+"_labeled_phrase_"+item.labeled_phrase} key={idx+Math.random()} style={{"marginTop":"10px", "border":"1px solid #000"}}>
                        <div style={{"paddingTop":"10px"}}><span>object_id: </span><span style={{"fontSize":"17px", "color":"green"}}>{item.object_id}</span></div>
                        <div style={{"paddingTop":"10px"}}><span>ann_id: </span><span style={{"fontSize":"17px", "color":"green"}}>{item.ann_id}</span></div>        
                        <div style={{"paddingTop":"10px"}}><span>labeled_id: </span><span style={{"fontSize":"17px", "color":"green"}}>{item.labeled_id}</span></div>   
                        <div style={{"paddingTop":"10px"}}><span>label_phrase: </span><span style={{"fontSize":"17px", "color":"green"}}>{item.labeled_phrase}</span></div>   
                        <div style={{"paddingTop":"10px"}}><span>index_phrase: </span><span style={{"fontSize":"17px", "color":"green"}}>{item._id}</span></div>                   
                        <div style={{"paddingTop":"10px"}}><button id={"objID_"+item.object_id+"_objName_"+item.object_name+"_annId_"+item.ann_id+"_labeled_phrase_"+item.labeled_phrase} className="delete_button_for_check">delete</button></div>
                        <div style={{"paddingTop":"10px"}}><button id={"highlight_objID_"+item.object_id+"_objName_"+item.object_name+"_annId_"+item.ann_id+"_labeled_phrase_"+item.labeled_phrase+'_labeled_id_'+item.labeled_id} className="highlight_button_for_check">highlight</button></div>
                    
                    </div>
                ))
                }
            </div>
        );
    }

}

export default InfoUI;
