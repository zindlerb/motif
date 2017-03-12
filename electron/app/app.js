import fs from 'fs';
import { remote } from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';
import { bindActionCreators } from 'redux';
import classnames from 'classnames';

import { store, actions } from './stateManager';
import AssetsView from './containers/AssetsView';
import EditorView from './containers/EditorView';
import Sidebar from './components/Sidebar';
import ComponentsViewTree from './containers/ComponentsViewTree';
import ComponentsViewRenderer from './containers/ComponentsViewRenderer';
import AttributesContainer from './containers/AttributesContainer';
import ComponentMenu from './components/ComponentMenu';
import ErrorBanner from './components/ErrorBanner';

import {
  saveSiteAsDialog,
  loadSiteDialog,
  createImmutableJSSelector
} from './utils';
import {
  mainViewTypes,
} from './constants';

const { Menu } = remote;

const App = React.createClass({
  componentDidMount() {
    const { actions } = this.props;
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
          /*
             TD: add in once export is working

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
           */
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
          },
          { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
          { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  },

  render() {
    let view;
    let {
      currentMainView,
      errorText,
      actions
    } = this.props;

    if (mainViewTypes.EDITOR === currentMainView) {
      view = <EditorView actions={actions} currentMainView={currentMainView} />;
    } else if (mainViewTypes.ASSETS === currentMainView) {
      view = <AssetsView actions={actions} />;
    } else if (mainViewTypes.COMPONENTS === currentMainView) {
      view = (
        <div className={classnames('flex h-100')}>
          <Sidebar direction="left">
            <ComponentsViewTree actions={actions} />
          </Sidebar>
          <ComponentsViewRenderer actions={actions} />
          <Sidebar direction="right">
            <AttributesContainer actions={actions} />
          </Sidebar>
        </div>
      );
    }

    return (
      <div className="h-100">
        <ErrorBanner errorText={errorText} actions={actions} />
        { view }
        <ComponentMenu actions={actions} />
      </div>
    );
  },
});

const appSelector = createImmutableJSSelector(
  [
    state => state.get('currentMainView'),
    state => state.get('errorText')
  ],
  (currentMainView, errorText) => {
    return {
      currentMainView,
      errorText
    };
  }
)

const ConnectedApp = connect(
  appSelector,
  (dispatch) => {
    return { actions: bindActionCreators(actions, dispatch) };
  }
)(App);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedApp />
  </Provider>,
  document.getElementById('content'),
);
