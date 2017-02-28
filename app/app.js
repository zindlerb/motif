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
  loadSiteDialog,
  createImmutableJSSelector
} from './utils';
import {
  mainViewTypes,
  SIDEBAR_WIDTH
} from './constants';

const { Menu } = remote;

const App = React.createClass({
  componentDidMount() {
    const { actions } = this.props;
    mousetrap.bind(['backspace', 'del'], () => {
      if (this.props.activeComponent) {
        this.props.deleteComponent(this.props.activeComponent);
      }
    }, 'keyup');

    const reloadDirname = '/Users/brianzindler/Documents/reload';

    fs.access(reloadDirname, (err) => {
      if (!err) {
        actions.loadSite(reloadDirname);
      } else {
        console.warn('No reload dir found');
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
            click: () => {
              actions.saveSite(this.props.dirname);
            }
          },
          {
            label: 'Save As',
            click() {
              saveSiteAsDialog(actions);
            }
          },
          {
            label: 'Export',
            click() {
              dialog.showSaveDialog({
                title: 'Export site as',
                filters: [
                  {
                    name: 'Site Name',
                    extensions: ['*']
                  }
                ]
              }, (filename) => {
                if (filename) {
                  actions.exportSite(filename);
                }
              });
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
      currentMainView,
      actions
    } = this.props;

    if (mainViewTypes.EDITOR === currentMainView) {
      view = <EditorView actions={actions} />;
    } else if (mainViewTypes.ASSETS === currentMainView) {
      view = <AssetsView actions={actions} />;
    } else if (mainViewTypes.COMPONENTS === currentMainView) {
      view = <ComponentsView actions={actions} />;
    }

    return (
      <div className="h-100">
        { view }
      </div>
    );
  },
});

const ConnectedApp = connect(
  (state) => {
    return { currentMainView: state.get('currentMainView') };
  },
  (dispatch) => {
    return { actions: bindActionCreators(actions, dispatch) }
  }
)(App);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedApp />
  </Provider>,
  document.getElementById('content'),
);
