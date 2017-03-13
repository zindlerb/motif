import React from 'react';
import classnames from 'classnames';

const FullscreenButton = function (props) {
  if (props.isFullscreenLocked) {
    return <div />;
  } else {
    return (
      <i
          onClick={props.actions.toggleFullscreen}
          className={classnames(
              'fa dib clickable fullscreen-button',
              props.className,
              props.isFullscreen ? 'fa-compress' : 'fa-expand'
            )}
          aria-hidden="true"
      />
    );
  }
};

export default FullscreenButton;
