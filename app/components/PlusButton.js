import React from 'react';
import classname from 'classname';

function PlusButton(props) {
  return (
    <i
        onClick={props.onClick}
        className={classnames("fa fa-plus-circle", props.className)}
        aria-hidden="true"
    />
  );
}

export default PlusButton;
