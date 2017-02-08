import React from 'react';

const UpArrow = function (props) {
  let fontSize = 16;
  return (
    <div
        style={{
          left: props.x,
          top: props.y - (fontSize / 2),
          fontSize
        }}
        className="up-arrow fixed"
    >
      &#9650;
    </div>
  );
}

export default UpArrow;
