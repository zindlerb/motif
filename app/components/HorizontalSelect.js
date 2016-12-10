import _ from 'lodash';
import classnames from 'classnames';
import React from 'react';

/* Call horizontal Select */

/*
   - hasBorder
   - options
   - onClick

change existing header instance

 */


export default function HorizontalSelect(props) {
  var options = _.map(props.options, function (option, ind) {
    var content;
    var headerClick = function() {
      props.onClick(option.name);
    }

    if (option.faClass) {
      content = <i className={classnames("icon", "fa", option.faClass)} aria-hidden="true"></i>;
    } else {
      content = <span>{option.text}</span>;
    }

    return (
      <div className={classnames("flex-auto tc pa1 h-100 c-pointer", {
          highlighted: option.name === props.activePanel,
        })}
           onClick={headerClick}
           key={ind}
      >
        {content}
      </div>
    );
  });

  return (
    <div className={classnames("horizontal-select justify-around flex", {
        border: props.hasBorder
      }, props.className)}>
      {options}
    </div>
  );
}
