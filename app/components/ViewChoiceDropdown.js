import React from 'react';
import Dropdown from './forms/Dropdown';

import { mainViewTypes } from '../constants';

function ViewChoiceDropdown(props) {
  return (
    <Dropdown
        className="mv2"
        value={props.mainView}
        onChange={(value) => { props.actions.changeMainView(value) }}
        choices={[
          { name: 'Editor', text: mainViewTypes.EDITOR },
          { name: 'Assets', text: mainViewTypes.ASSETS },
          { name: 'Components', text: mainViewTypes.COMPONENTS },
        ]}
    />
  );
}

export default ViewChoiceDropdown;
