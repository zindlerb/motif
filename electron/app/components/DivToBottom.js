import _ from 'lodash';
import React from 'react';
import $ from 'jquery';

const DivToBottom = React.createClass({
  getInitialState() {
    return {
      height: undefined
    }
  },

  componentDidMount() {
    const resize = _.debounce(() => {
      this.setState(
        { height: this.getHeight() }
      );
    }, 500);

    this.setState({ height: this.getHeight() });
    window.addEventListener('resize', resize);
  },

  getHeight() {
    return document.documentElement.clientHeight - $(this._el).offset().top;
  },

  render() {
    return (
      <div
          ref={(el) => { this._el = el }}
          className={this.props.className}
          style={{ height: this.state.height }}
      >
        {this.props.children}
      </div>
    )
  }
});

export default DivToBottom;
