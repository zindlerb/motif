import React from 'react';
import classnames from 'classnames';

function CartoonButton(props) {
  const { text, onClick, classNames } = props;

  return (
    <button
        onClick={onClick}
        className={classnames(classNames, 'pv1 ph2 cartoon-button f6')}>
      {text}
    </button>
  );
}

export default CartoonButton;
