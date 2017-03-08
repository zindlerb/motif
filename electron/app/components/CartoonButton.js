import React from 'react';
import classnames from 'classnames';

function CartoonButton(props) {
  const { text, onClick, className, size, disabled } = props;

  return (
    <button
        onClick={(e) => {
            if (!disabled) {
              onClick(e)
            }
          }}
        className={classnames(className, 'cartoon-button', size, { disabled: disabled })}>
      {text}
    </button>
  );
}

export default CartoonButton;
