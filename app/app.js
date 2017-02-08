// ES6 Component
// Import React and ReactDOM
import fs from 'fs';
import { remote } from 'electron';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import mousetrap from 'mousetrap';
import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { connect, Provider } from 'react-redux';
import { bindActionCreators } from 'redux';
import { store, actions } from './stateManager';

import OpenSiteModal from './containers/OpenSiteModal';
import LeftPanel from './containers/LeftPanel';
import StaticRenderer from './containers/StaticRenderer';
import DropPointRenderer from './containers/DropPointRenderer';
import ComponentMenu from './containers/ComponentMenu';
import ViewChoiceDropdown from './components/ViewChoiceDropdown';
import Attributes from './containers/Attributes';
import AssetsView from './containers/AssetsView';
import {
  saveSiteAsDialog,
  saveSiteDialog,
  loadSiteDialog
} from './utils';
import {
  mainViewTypes
} from './constants';

const { Menu } = remote;

const Editor = React.createClass({
  componentDidMount() {
    const { actions } = this.props;
    mousetrap.bind(['backspace', 'del'], () => {
      if (this.props.activeComponent) {
        this.props.deleteComponent(this.props.activeComponent);
      }
    }, 'keyup');

    const reloadFilename = '/Users/brianzindler/Documents/reload.json';
    fs.readFile(reloadFilename, 'utf8', (err, file) => {
      if (err) {
        console.warn('Reload File Not Found');
      } else {
        actions.siteLoadSuccess(reloadFilename, file);
      }
    });

    const template = [
      {
        submenu: [
          {
            label: 'Quit',
            click() {
            }
          }
        ]
      },
      {
        label: 'File',
        submenu: [
          {
            label: 'Open',
            click() {
              loadSiteDialog(actions);
            }
          },
          {
            label: 'Save',
            click() {
              saveSiteDialog(actions);
            }
          },
          {
            label: 'Save As',
            click() {
              saveSiteAsDialog(actions);
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  },

  render() {
    let view;
    let {
      actions,
      currentMainView
    } = this.props;

    if (mainViewTypes.EDITOR === currentMainView) {
      view = (
        <div className={classnames('flex h-100')}>
          <div className="sidebar flex-none h-100">
            <LeftPanel actions={actions} />
          </div>
          <div className="flex-auto flex flex-column h-100 mh4 relative">
            <ViewChoiceDropdown
                mainView={currentMainView}
                actions={actions}
            />
            <StaticRenderer actions={actions} />
          </div>
          <div className="sidebar h-100 flex-none">
            <Attributes actions={actions} />
          </div>
          <DropPointRenderer />
          <OpenSiteModal actions={actions} />
        </div>
      );
    } else if (mainViewTypes.ASSETS === currentMainView) {
      view = <AssetsView actions={actions} />
    } else if (mainViewTypes.COMPONENTS === currentMainView) {
      view = (
        <div>
          COMPONENTS
        </div>
      );
    }

    return (
      <div className="h-100">

        { view }
        <ComponentMenu actions={actions} />
      </div>
    );
  },
});

/*
   Top level inject just actions
   All components connect from there.
   Turn off pure for all.
 */

const connector = connect(
  (state) => {
    return {
      currentMainView: state.currentMainView
    }
  },
  (dispatch) => {
    return { actions: bindActionCreators(actions, dispatch) };
  },
  null,
  { pure: false }
);
const dndContext = DragDropContext(HTML5Backend)

const EditorWithDispatch = dndContext(connector(Editor));

ReactDOM.render(
  <Provider store={store}>
    <EditorWithDispatch />
  </Provider>,
  document.getElementById('content'),
);
