// ES6 Component
// Import React and ReactDOM
import { remote } from 'electron';
let dialog = remote.dialog;

import fs from 'fs';
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { dragManager, DragImage } from './dragManager.js';
import classnames from 'classnames';
import $ from 'jquery';
import { store, actionDispatch, serializer } from './stateManager.js';

import LeftPanel from './components/LeftPanel.js';
import RightPanel from './components/RightPanel.js';
import StaticRenderer from './components/StaticRenderer.js';
import ComponentTree from './components/ComponentTree.js';
import DropPointRenderer from './components/DropPointRenderer.js';

import Something from './tests/component_model.js';

const App = React.createClass({
  getInitialState() {
    return store.getState();
  },

  componentDidMount() {
    const that = this;
    store.subscribe(function () {
      that.setState(store.getState());
    });

    this.openFile('/Users/brianzindler/Documents/reload.json');
  },

  saveSite () {
    function writeFile(filename, state) {
      console.log('saved state:', JSON.parse(serializer.serialize(state)));
      fs.writeFile(filename, serializer.serialize(state));
    }

    if (this.state.nonSerializable && this.state.nonSerializable.filename) {
      writeFile(state.nonSerializable.filename, this.state);
    } else {
      dialog.showSaveDialog({
        title: 'Save Site',
        filters: [
          {
            name: 'motif file',
            extensions: ['json']
          }
        ]
      }, (filename) => {
        writeFile(filename, this.state);
      });
    }
  },

  openFile(filename) {
    fs.readFile(filename, 'utf8', function (err, file) {
      if (err) {
        console.warn("No file found for ", filename);
      } else {
        var state = serializer.deserialize(file);
        state.nonSerializable = { filename: filename };
        actionDispatch.openSite(state);
      }
    });
  },

  openSite () {
    dialog.showOpenDialog({
      title: 'Select a site to edit',
      properties: ['openFile'],
      filters: [
        {
          name: 'motif file',
          extensions: ['json']
        }
      ]
    }, (filenames) => {
      if (!filenames) return;
      this.openFile(filenames[0]);
    })
  },

  render() {
    let {
      componentBoxes,
      activeLeftPanel,
      activeRightPanel,
      pages,
      currentPage,
      activeComponent,
      dropPoints,
      activeView,
      nodeIdsInHoverRadius,
      globalCursor,
      treeDropPoints,
      treeSelectedDropPoint
    } = this.state;

    window.state = this.state;

    return (
      <div className="h-100">
        <button onClick={this.openSite}>Open</button>
        <button onClick={this.saveSite}>Save</button>
        <div className={classnames('flex h-100', globalCursor)}>
          <div className="sidebar flex-none h-100">
            <LeftPanel components={componentBoxes} pages={pages} activePanel={activeLeftPanel} currentPage={currentPage} />
          </div>
          <div className="flex-auto w-100 h-100">
            <StaticRenderer
                page={currentPage}
                activeView={activeView}
                componentProps={{
                  activeComponent,
                  nodeIdsInHoverRadius,
                }}
            />
          </div>
          <div className="sidebar h-100 flex-none">
            <RightPanel
                activeComponent={activeComponent}
                activePanel={activeRightPanel}
                tree={currentPage.componentTree}
                treeDropPoints={treeDropPoints}
                treeSelectedDropPoint={treeSelectedDropPoint}
            />
          </div>
          <DropPointRenderer dropPoints={dropPoints} />
          <DragImage />
        </div>
      </div>
    );
  },
});

ReactDOM.render(< App / >,
                 document.getElementById('content'),
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
