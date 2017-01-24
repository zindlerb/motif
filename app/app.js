// ES6 Component
// Import React and ReactDOM
import { remote } from 'electron';
import mousetrap from 'mousetrap';
import fs from 'fs';
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import classnames from 'classnames';
import $ from 'jquery'
import { connect, bindActionCreators } from 'redux';

import { DragImage, dragManager } from './dragManager';
import { store, actions } from './stateManager';
import serializer from './serializer';
import { globalEventManager } from './utils';

import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import StaticRenderer from './components/StaticRenderer';
import DropPointRenderer from './components/DropPointRenderer';
import ComponentMenu from './components/ComponentMenu';

let dialog = remote.dialog;

const Editor = React.createClass({
  componentDidMount() {
    globalEventManager.addListener('mouseup', () => {
      if (this.state.menu.isOpen) {
        actionDispatch.closeMenu();
      }

      // TD: add back in in some way. Right now is too trigger happy
      /* if (this.state.activeComponent) {
       *   actionDispatch.selectComponent(undefined);
       * }*/
    }, 10000);

    mousetrap.bind(['backspace', 'del'], () => {
      if (this.state.activeComponent) {
        actionDispatch.deleteComponent(this.state.activeComponent);
      }
    }, 'keyup');

    setInterval(() => {
      if (this.state.nonSerializable &&
          this.state.nonSerializable.filename) {
        this.saveSite();
      }
    }, 1000 * 60);

    /*this.openFile('/Users/brianzindler/Documents/reload.json');*/
  },

  saveSite() {
    function writeFile(filename, state) {
      fs.writeFile(filename, serializer.serialize(state));
      actionDispatch.setActiveFilename(filename);
    }

    if (this.state.nonSerializable && this.state.nonSerializable.filename) {
      writeFile(this.state.nonSerializable.filename, this.state);
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
        console.warn('No file found for ', filename);
      } else {
        actionDispatch.openSite(serializer.deserialize(file), filename);
        actionDispatch.setActiveFilename(filename);
      }
    });
  },

  openSite() {
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
    });
  },

  render() {
    let {
      activeComponentState,
      componentBoxes,
      activeLeftPanel,
      activeRightPanel,
      pages,
      currentPage,
      activeComponent,
      activeView,
      globalCursor,

      otherPossibleComponentViewDropSpots,
      selectedComponentViewDropSpot,

      otherPossibleTreeViewDropSpots,
      selectedTreeViewDropSpot,
      menu,
      assets,
      activeBreakpoint,
      rendererWidth,
      hoveredComponent
    } = this.state;



    console.log(this.props);

    return (
      <div className="h-100" ref={(el) => { this._el = el; }}>
        <button onClick={this.openSite}>Open</button>
        <button onClick={this.saveSite}>Save</button>
        <div className={classnames('flex h-100', globalCursor)}>
          <div className="sidebar flex-none h-100">
            <LeftPanel
                assets={assets}
                components={componentBoxes}
                pages={pages}
                activePanel={activeLeftPanel}
                selectedComponentViewDropSpot={selectedComponentViewDropSpot}
                currentPage={currentPage}
            />
          </div>
          <div
              className="flex-auto h-100 mh4 relative"
              ref={(el) => { this._rendererEl = el }}
          >
            <StaticRenderer
                width={rendererWidth}
                page={currentPage}
                activeBreakpoint={activeBreakpoint}
                activeView={activeView}
                context={{
                  hoveredComponent,
                  activeComponent,
                  selectedComponentViewDropSpot
                }}
            />
          </div>
          <div className="sidebar h-100 flex-none">
            <RightPanel actions={actions} />
          </div>
          <DropPointRenderer />
          <DragImage />
        </div>
        <ComponentMenu actions={actions}/>
      </div>
    );
  },
});

/*
   Top level inject just actions
   All components connect from there.
   Turn off pure for all.
*/

const EditorWithDispatch = connect(null, (dispatch) => {
  return { actions: bindActionCreators(actions, dispatch) };
})(Editor);

ReactDOM.render(
  <Provider store={store}>
    <EditorWithDispatch />
  </Provider>,
  document.getElementById('content'),
);
