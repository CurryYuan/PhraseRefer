import React from 'react';
import ReactDOM from 'react-dom';
import RootUI from './view/RootUI';

class ErrorPage {
    
    /********************************************
     *************       init       *************
     ********************************************/    
    init () {
        ReactDOM.render(<RootUI/>, document.getElementById('id_div_root'));
    }
}

window.ErrorPage = ErrorPage;