import React from 'react';
import classnames from 'classnames';

import UpArrow from './UpArrow';

export default function SimplePopupSelectDropdown(props) {
  /*
     items:
         text, value
     activeValue
     onClick
   */
  const sx = {
    top: props.y,
    left: props.x
  };
  const listItems = props.items.map(function (itemData) {
    return (
      <li
          key={itemData.text}
          className={classnames({
              highlighted: itemData.value === props.activeValue
            })}
          onClick={() => props.onClick(itemData.value)}>
        {itemData.text}
      </li>
    );
  });

  return (
    <div>
      <div
          className="popup tl fixed"
          style={sx}>
        <ul>
          {listItems}
        </ul>
      </div>
      <UpArrow x={props.x} y={props.y} />
    </div>
  );
}
