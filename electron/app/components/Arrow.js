import React from 'react';

const Arrow = function (props) {
  let sx, char;
  if (props.size) {
    sx = {
      fontSize: props.size
    };
  }

  if (props.direction === 'up') {
    char = <span>&#x25b2;</span>;
  } else if (props.direction === 'down') {
    char = <span>&#x25bc;</span>;
  } else if (props.direction === 'left') {
    char = <span>&#x25c0;</span>;
  } else if (props.direction === 'right') {
    char = <span>&#x25ba;</span>;
  }

  console.log('arrow render');

  return (
    <div
        style={sx}
        className={props.className}
    >
      {char}
    </div>
  );
}

export default Arrow;
