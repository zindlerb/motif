import React from 'react';

function Popup() {
  return <div></div>;
}

const PopupSelect = React.createClass({
  getInitialState() {
    return {
      isOpen: false,
    }
  },
  render() {
    let popup;
    if (this.state.isOpen) {
      popup = (

      );
    }

    return (
      <div >
        {this.props.value}
        <img alt="" src="/public/images/assets/down-triangle.svg"/>
        {popup}
      </div>
    );
  }
});

export default PopupSelect;
