import React from 'react';
import classnames from 'classnames';

import PopupSelect from './PopupSelect';
import { mainViewTypes } from '../constants';
import UpArrow from './UpArrow';

function ChoiceViewPopup(props) {
  const items = [
    { text: 'Editor', value: mainViewTypes.EDITOR },
    { text: 'Assets', value: mainViewTypes.ASSETS },
    { text: 'Components', value: mainViewTypes.COMPONENTS },
  ].map(function (itemData) {
    return (
      <li
          className={classnames({
              highlighted: itemData.value === props.mainView
            })}
          onClick={() => props.actions.changeMainView(itemData.value)}>
        {itemData.text}
      </li>
    );
  });

  return (
    <div>
      <div
          className="popup tl fixed"
          style={{
            top: props.y,
            left: '50%'
          }}>
        <ul>
          {items}
        </ul>
      </div>
      <UpArrow y={props.y} x="50%" />
    </div>
  );
}

function ViewChoiceDropdown(props) {
  return (
    <div className="tc">
    <PopupSelect
        className="mv3 w4"
        value={props.mainView}>
      <ChoiceViewPopup
          mainView={props.mainView}
          actions={props.actions}
      />
    </PopupSelect>
    </div>
  );
}

export default ViewChoiceDropdown;
