import React from 'react';
import Dropdown from './forms/Dropdown';

import { mainViewTypes } from '../constants';

function ViewChoiceDropdown(props) {
  return (
    <div className="tc">
    <Dropdown
        className="mv2 w4"
        value={props.mainView}
        onChange={(value) => { props.actions.changeMainView(value) }}
        choices={[
          { text: 'Editor', value: mainViewTypes.EDITOR },
          { text: 'Assets', value: mainViewTypes.ASSETS },
          { text: 'Components', value: mainViewTypes.COMPONENTS },
        ]}
    />
    </div>
  );
}

export default ViewChoiceDropdown;
