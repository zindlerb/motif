// ES6 Component
// Import React and ReactDOM
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import mousetrap from 'mousetrap';
import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { connect, Provider } from 'react-redux';
import { bindActionCreators } from 'redux';
import { store, actions } from './stateManager';

import MenuBar from './containers/MenuBar';
import LeftPanel from './containers/LeftPanel';
import RightPanel from './containers/RightPanel';
import StaticRenderer from './containers/StaticRenderer';
import DropPointRenderer from './containers/DropPointRenderer';
import ComponentMenu from './containers/ComponentMenu';

const Editor = React.createClass({
  componentDidMount() {
    mousetrap.bind(['backspace', 'del'], () => {
      if (this.props.activeComponent) {
        this.props.deleteComponent(this.props.activeComponent);
      }
    }, 'keyup');

    /*this.openFile('/Users/brianzindler/Documents/reload.json');*/
  },

  render() {
    let {
      actions
    } = this.props;

    return (
      <div className="h-100" ref={(el) => { this._el = el; }}>
        <MenuBar actions={actions} />
        <div className={classnames('flex h-100')}>
          <div className="sidebar flex-none h-100">
            <LeftPanel actions={actions} />
          </div>
          <div
              className="flex-auto h-100 mh4 relative"
              ref={(el) => { this._rendererEl = el }}
          >
            <StaticRenderer actions={actions} />
          </div>
          <div className="sidebar h-100 flex-none">
            <RightPanel actions={actions} />
          </div>
          <DropPointRenderer />
        </div>
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

const connector = connect(null, (dispatch) => {
  return { actions: bindActionCreators(actions, dispatch) };
});
const dndContext = DragDropContext(HTML5Backend)

const EditorWithDispatch = dndContext(connector(Editor));

ReactDOM.render(
  <Provider store={store}>
    <EditorWithDispatch />
  </Provider>,
  document.getElementById('content'),
);
