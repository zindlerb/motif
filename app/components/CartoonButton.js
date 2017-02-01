import React from 'react';
import classnames from 'classnames';

function CartoonButton(props) {
  const { text, onClick, className, size } = props;

  return (
    <button
        onClick={onClick}
        className={classnames(className, 'cartoon-button', size)}>
      {text}
    </button>
  );
}

export default CartoonButton;
