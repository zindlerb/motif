// ES6 Component
// Import React and ReactDOM
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import dragManager from './dragManager.js';
import classnames from 'classnames';
import $ from 'jquery';
import {store} from './stateManager.js';

/* Components */
import LeftPanel from './components/LeftPanel.js';
import RightPanel from './components/RightPanel.js';
import StaticRenderer from './components/StaticRenderer.js';
import ComponentTree from './components/ComponentTree.js';
import DropPointRenderer from './components/DropPointRenderer.js';

import Something from './tests/component_model.js';

var App = React.createClass({
  getInitialState: function() {
    return store.getState();
  },

  componentDidMount: function() {
    var that = this;
    store.subscribe(function() {
      that.setState(store.getState());
    });
  },

  render: function() {
    var {
      componentBoxes,
      activeLeftPanel,
      activeRightPanel,
      pages,
      currentPage,
      activeComponent,
      dropPoints,
      activeView,
      nodeIdsInHoverRadius
    } = this.state;

    return (
      <div className="flex h-100">
        <div className="sidebar flex-none h-100">
          <LeftPanel components={componentBoxes} pages={pages} activePanel={activeLeftPanel} currentPage={currentPage}/>
        </div>
        <div className="flex-auto w-100 h-100">
          <StaticRenderer
              page={currentPage}
              activeView={activeView}
              componentProps={{
                activeComponent: activeComponent,
                nodeIdsInHoverRadius
              }}/>
        </div>
        <div className="sidebar h-100 flex-none">
          <RightPanel activeComponent={activeComponent} activePanel={activeRightPanel} />
        </div>
        <DropPointRenderer dropPoints={dropPoints}/>
      </div>
    );
  }
})

ReactDOM.render( < App / > ,
                 document.getElementById('content')
);

/*

   finish full app with low performance and insanely simple structure so there is more room for tuneups.


   For performance I can do a has mutated flag and use connectors to sync up...
   Isn't this essentially like having components subscribe to specific state?


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
