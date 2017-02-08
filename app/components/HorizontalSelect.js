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
  const options = _.map(props.options, function (option, ind) {
    let content;
    const headerClick = function (e) {
      props.onClick(option.value);
      e.stopPropagation();
    };

    if (option.faClass) {
      content = <i className={classnames('icon', 'fa', option.faClass)} aria-hidden="true" />;
    } else if (option.src) {
      content = <img src={option.src} className="img" />;
    } else {
      content = <span className="f6">{option.text}</span>;
    }

    return (
      <div
          className={classnames('flex-auto tc pv1 ph2 h-100 c-pointer', {
              highlighted: option.value === props.activePanel,
            })}
          onMouseUp={headerClick}
          key={ind}
      >
        {content}
      </div>
    );
  });

  return (
    <div
      className={classnames('horizontal-select justify-around align-center', {
        border: props.hasBorder,
      }, props.className)}
    >
      {options}
    </div>
  );
}
