import React from 'react';

const ErrorBanner = React.createClass({
  render() {
    if (this.props.errorText) {
      return (
        <div
            className="error-banner clickable"
            onClick={() => {
                this.props.actions.setErrorText(undefined);
              }}>
          {this.props.errorText}
          <i className="mh2 fa fa-times" aria-hidden="true" />
        </div>
      )
    } else {
      return (<div />);
    }
  }
});

export default ErrorBanner;
