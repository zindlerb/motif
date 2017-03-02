import React from 'react';
import classnames from 'classnames';
import { SIDEBAR_WIDTH } from '../constants';

const Sidebar = function (props) {
  const { children, direction } = props;
  return (
    <div
        className={classnames('sidebar h-100 flex-none', direction)}
        style={{ width: SIDEBAR_WIDTH }}
    >
      { children }
    </div>
  )
}

export default Sidebar;
