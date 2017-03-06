import React from 'react';

import PopupSelect from './PopupSelect';
import SimplePopupSelectDropdown from './SimplePopupSelectDropdown';
import { mainViewTypes } from '../constants';

function ViewChoiceDropdown(props) {
  return (
    <div className="tc">
    <PopupSelect
        className="mv3 w4"
        value={props.mainView}>
      <SimplePopupSelectDropdown
          items={[
            { text: 'Editor', value: mainViewTypes.EDITOR },
            { text: 'Assets', value: mainViewTypes.ASSETS },
            { text: 'Components', value: mainViewTypes.COMPONENTS },
          ]}
          activeValue={props.mainView}
          onClick={value => props.actions.changeMainView(value)}
      />
    </PopupSelect>
    </div>
  );
}

export default ViewChoiceDropdown;
