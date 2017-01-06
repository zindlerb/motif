import React from 'react';
import _ from 'lodash';
import { actionDispatch, MENU_STATES } from '../stateManager.js';

function makeMenuStateDispatch(state) {
  return function () {
    actionDispatch.newMenuState(state);
  }
}

var listItems = [
  {
    value: 'Insert',
    onClick: makeStateDispatch(MENU_STATES.INSERTION)
  },
  {
    value: 'Insert',
    onClick: makeStateDispatch(MENU_STATES.INSERTION)
  },
  {
    value: 'Insert',
    onClick: actionDispatch.delete
  }
]

const ComponentMenu = React.createClass({
  getInitialState: function () {
    return { searchString: '' };
  },
  render: function() {


    return (
      <ul>
        {listElements}
      </ul>
    );
  }
});

export default ComponentMenu;
