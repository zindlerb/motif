import React from 'react';

const TextField = React.createClass({
  getInitialState() {
    return {
      isEditing: false,
      tempText: '',
    };
  },
  onChange(e) {
    this.setState({ tempText: e.target.value });
  },
  startEdit() {
    this.setState({
      isEditing: true,
      tempText: this.props.value,
    });
  },
  submit(e) {
    this.setState({
      isEditing: false,
      tempText: '',
    });

    if (this.props.onSubmit) {
      this.props.onSubmit(e.target.value);
    }
  },
  render() {
    const { isEditing, tempText } = this.state
    const value = isEditing ? tempText : this.props.value;

    if (this.props.isLarge) {
      return (
        <textarea
            value={value}
            onFocus={this.startEdit}
            onBlur={this.submit}
            onChange={this.onChange}
            onMouseUp={e => e.stopPropagation()}
            cols={20}
            rows={10}
        />
      );
    } else {
      return (<input
                  className="w-100"
                  onMouseUp={e => e.stopPropagation()}
                  onFocus={this.startEdit}
                  onBlur={this.submit}
                  onChange={this.onChange}
                  type="text"
                  value={value}
              />);
    }
  },
});

export default TextField;
