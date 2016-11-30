// ES6 Component
// Import React and ReactDOM
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import dragManager from './dragManager.js';
import classnames from 'classnames';
import $ from 'jquery';

import stateManager from './stateManager.js';

/* Components */
import ComponentSidebar from './components/ComponentSidebar.js';
import StaticRenderer from './components/StaticRenderer.js';
import ComponentTree from './components/ComponentTree.js';




var App = React.createClass({
    getInitialState: function() {
        return stateManager.getState();
    },

    componentDidMount: function() {
        stateManager.registerChangeCallback((newState) => {
            this.setState(newState);
        });
    },
    
    render: function() {
        var components = this.state.activeSite.components;
        /* <ComponentTree node={this.state.currentPage} components={components}/> */
        return (
            <div className="flex h-100">
                <div className="sidebar flex-none h-100">
                    <ComponentSidebar components={this.state.components} components={components}/>
                </div>
                <div className="flex-auto w-100 h-100">
                    <StaticRenderer page={this.state.currentPage}/>
                </div>
                <div className="sidebar h-100 flex-none">
                    
                </div>                
            </div>
        );
    }
})

// Render to ID content in the DOM
ReactDOM.render( < App / > ,
                 document.getElementById('content')
);

/*
   Need to revise the flex grow flex shrink ideas.... Growing is natural in many cases. Should closer map to how it is set up like I want this constant and I want this not...

   Proposed superdiv spec
     - Horizontal or Vertical
     - Fills 100% of the width
     - When horizontal
       - Non fixed sizes fill the rest of the width
       - Can set the distribution along both axis like in flex.


    - if it hits the side evenly distribute the elements?


    - What if it is justified left and you don't hit the side of the containing element?
*/




