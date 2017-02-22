import fs from 'fs';
import { remote } from 'electron';
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
import ComponentMenu from './containers/ComponentMenu';
import ViewChoiceDropdown from './components/ViewChoiceDropdown';
import Attributes from './containers/Attributes';
import AssetsView from './containers/AssetsView';
import {
  saveSiteAsDialog,
  saveSiteDialog,
  loadSiteDialog,
  createImmutableJSSelector
} from './utils';
import {
  mainViewTypes,
  SIDEBAR_WIDTH
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

    // TD:
    // create menu from instances
    // save redo instance on component
    // enable and disable per-state

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
      },
      {
        label: 'Edit',
        submenu: [
          {
            label: 'Undo',
            click() {
              actions.undo();
            }
          },
          {
            label: 'Redo',
            click() {
              actions.redo()
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  },

  render() {
    //console.log('APP RENDER');
    let view;
    let {
      actions,
      currentMainView
    } = this.props;

    if (mainViewTypes.EDITOR === currentMainView) {
      view = (
        <div className={classnames('flex h-100')}>
          <div className="sidebar flex-none h-100" style={{ width: SIDEBAR_WIDTH }}>
            <LeftPanel actions={actions} />
          </div>
          <div className="flex-auto flex flex-column h-100 mh4 relative">
            <ViewChoiceDropdown
                mainView={currentMainView}
                actions={actions}
            />
            <StaticRenderer actions={actions} />
          </div>
          <div className="sidebar h-100 flex-none" style={{ width: SIDEBAR_WIDTH }}>
            <Attributes actions={actions} />
          </div>
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

    // Drag over is to prevent a drag cancel on mouse up but I want to be able to drag anywhere
    return (
      <div className="h-100">
        { view }
        <ComponentMenu actions={actions} />
      </div>
    );
  },
});

const appSelector = createImmutableJSSelector(
  state => state.get('currentMainView'),
  (currentMainView) => { return { currentMainView } }
)

const connector = connect(
  (state) => {
    return appSelector(state);
  },
  (dispatch) => {
    return { actions: bindActionCreators(actions, dispatch) };
  }
);
const EditorWithDispatch = connector(Editor);

ReactDOM.render(
  <Provider store={store}>
    <EditorWithDispatch />
  </Provider>,
  document.getElementById('content'),
);
