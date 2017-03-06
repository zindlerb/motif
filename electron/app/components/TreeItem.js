import React from 'react';
import classnames from 'classnames';

function Arrow(props) {
  return (
    <span
        onClick={props.onClick}
        className={classnames('collapsableArrow c-pointer', { open: props.isOpen })}>
      &#x25ba;
    </span>
  );
}

const TreeItem = function (props) {
  let arrow;
  if (props.isContainer) {
    arrow = (
      <Arrow
          isOpen={props.isEmpty || props.isOpen}
          onClick={(e) => {
              if (!props.isEmpty) {
                props.toggleTreeItem(props.nodeId)
              }
              e.stopPropagation();
            }}
      />
    );
  }

  return (
    <div
        onMouseDown={props.onMouseDown}
        onMouseUp={props.onMouseUp}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
        className={classnames(
        'treeItem pv1',
        props.className,
      )}>
      {arrow}
      <span>
        {props.children}
      </span>
    </div>

  );
}

export default TreeItem;
