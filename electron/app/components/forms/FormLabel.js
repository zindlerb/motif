import React from 'react';
import classnames from 'classnames';

export default function FormLabel(props) {
  return (
    <div className={classnames(props.className)}>
      <div className="mb1">
        <span className="f7">{props.name}:</span>
      </div>
      {props.children}
    </div>
  );
}
