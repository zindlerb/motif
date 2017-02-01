import React from 'react';

// Child is a form field
export default function FormLabel(props) {
  return (
    <div className="mb2">
      <div className="mb1">
        <span className="f7">{props.name}:</span>
      </div>
      {props.children}
    </div>
  );
}
