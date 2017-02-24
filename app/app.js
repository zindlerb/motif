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

const Editor = React.createClass({
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
              console.log(this.props.dirname);
              actions.saveSite(this.props.dirname);
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
          <div className="sidebar left flex-none h-100" style={{ width: SIDEBAR_WIDTH }}>
            <LeftPanel actions={actions} />
          </div>
          <div className="flex-auto flex flex-column h-100 mh4 relative">
            <ViewChoiceDropdown
                mainView={currentMainView}
                actions={actions}
            />
            <StaticRenderer actions={actions} />
          </div>
          <div className="sidebar right h-100 flex-none" style={{ width: SIDEBAR_WIDTH }}>
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
  [
    state => state.get('currentMainView'),
    state => {
      console.log(state.toJS());
      return state.getIn(['fileMetadata', 'dirname'])
    }
  ],
  (currentMainView, dirname) => {
    return { currentMainView, dirname }
  }
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
