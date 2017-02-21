import React from 'react';
import classnames from 'classnames';

const TreeItem = function (props) {
  return (
    <span
        className={classnames(
            'treeItem w-100 pv1 c-grab db',
            props.className,
          )}
        onMouseDown={props.onMouseDown}
        onMouseUp={props.onMouseUp}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
    >
      {props.children}
    </span>
  );
}

export default TreeItem;
