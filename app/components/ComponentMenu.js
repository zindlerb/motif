import React from 'react';
import _ from 'lodash';
import { actionDispatch, MENU_STATES } from '../stateManager.js';

export const MENU_STATES = {
  CLOSED: 'CLOSED',

  /* Open States */
  ROOT: 'ROOT',
  INSERTION: 'INSERTION',
  WRAP: 'WRAP',
}

function makeMenuStateDispatch(state) {
  return function (props) {
    function () {
      actionDispatch.newMenuState(state);
    }
  }
}

export const MENU_STATES = {
  /* Open States */
  ROOT: 'ROOT',
  INSERTION: 'INSERTION',
  WRAP: 'WRAP',
}

const ComponentMenu = React.createClass({
  getInitialState: function () {
    return {
      searchString: '',
      menuState:
    };
  },

  render: function() {
    let { menuState } = this.state;
    let listItems;
    if (menuState === MENU_STATES.ROOT) {
      listItems = [
        (<li onClick={() => { this.setState({menuState: MENU_STATES.INSERTION}) }}>
          Insert
        </li>),

        (<li onClick={() => { this.setState({menuState: MENU_STATES.WRAP}) }}>
          Wrap
        </li>),

        (<li onClick={() => {
            actionDispatch.deleteComponent(this.props.component);
            actionDispatch.closeMenu();
          }}>
          Delete
        </li>),

        (<li onClick={() => {
            actionDispatch.createComponentBlock(this.props.component);
            actionDispatch.closeMenu();
          }}>
          Make Component
        </li>)
      ]
    } else if (menuState === MENU_STATES.INSERTION || menuState === MENU_STATES.WRAP) {
      listItems = [
        (<li onClick={() => {this.setState({menuState: MENU_STATES.ROOT})}}>Back</li>),
        (<li onChange={(e) => { this.setState({searchString: e.target.value}); }}>
          Back
        </li>),
      ]

      listItems = listItems.concat()
    }

    return (
      <ul>
        {listElements}
      </ul>
    );
  }
});

export default ComponentMenu;
