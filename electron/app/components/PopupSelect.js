import $ from 'jquery';
import React from 'react';
import classnames from 'classnames';

import { toTitleCase } from '../utils';

const PopupSelect = React.createClass({
  getInitialState() {
    return {
      isOpen: false,
    }
  },
  render() {
    let popup, pos, margin = 15;
    if (this.state.isOpen) {
      if (this.el) {
        let jqEl = $(this.el);
        let offset = jqEl.offset();
        let height = jqEl.height();
        pos = {
          x: offset.left + (jqEl.width() / 2),
          y: offset.top + height + margin,
        }
      }

      popup = (
        <div>
          <div
              onClick={() => this.setState({ isOpen: false })}
              style={{ left: 0, top: 0 }}
              className="absolute w-100 h-100"
          />
          {React.cloneElement(this.props.children, pos)}
        </div>
      )
    }

    return (
      <div className="popup-select">
        <div
            ref={(ref) => { this.el = ref }}
            className={classnames(this.props.className, 'dib')}
            onClick={() => this.setState({ isOpen: true })}
        >
          {toTitleCase(this.props.value)}
          <img
              className="icon-small dib ph1"
              src="public/img/assets/down-triangle.svg" />
        </div>
        {popup}
      </div>
    );
  }
});

export default PopupSelect;
