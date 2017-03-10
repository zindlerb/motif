import React from 'react';
import $ from 'jquery';
import classnames from 'classnames';

const AutoComplete = React.createClass({
  render() {
    const { position, items, width } = this.props;
    const sx = {
      width,
      position: 'absolute',
      top: position.x,
      left: position.y
    };

    let listItems = items.map((item) => {
      return (
        <li
            key={item.value}
            onMouseUp={() => {
                this.props.onSubmit(item.value, true);
              }}>
          {item.name}
        </li>
      );
    });

    return (
      <ul
          style={sx}
          className="autocomplete"
          onMouseEnter={this.props.onMouseEnter}
          onMouseLeave={this.props.onMouseLeave}
      >
        {listItems}
      </ul>
    );
  }
});

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
  submit(val, isAutoComplete) {
    if (this.isInsideAutoComplete && !isAutoComplete) {
      /*
         Hack to deal with race condition of blur event
         firing before the click on the autocomplete.
       */
      return;
    }

    this.setState({
      isEditing: false,
      tempText: '',
    });

    if (this.props.onSubmit) {
      this.props.onSubmit(val);
    }

    this.isInsideAutoComplete = false
  },
  render() {
    const { isEditing, tempText } = this.state
    const { autoCompleteItems } = this.props;
    const value = isEditing ? tempText : this.props.value;
    let pos, autoComplete;

    if (autoCompleteItems && isEditing && this._el) {
      pos = {
        x: this._el.clientX,
        y: this._el.clientY
      }

      autoComplete = (
        <AutoComplete
            width={$(this._el).width()}
            position={pos}
            onSubmit={this.submit}
            items={autoCompleteItems}
            onMouseEnter={() => { this.isInsideAutoComplete = true; }}
            onMouseLeave={() => { this.isInsideAutoComplete = false; }}
        />
      );
    }

    if (this.props.isLarge) {
      return (
        <textarea
            value={value}
            onFocus={this.startEdit}
            onBlur={e => this.submit(e.target.value)}
            onChange={this.onChange}
            onMouseUp={e => e.stopPropagation()}
            cols={20}
            rows={10}
        />
      );
    } else {
      return (
        <div className="w-100">
          <input
              ref={(el) => {
                  if (el && this.props.autoFocus && document.activeElement !== el) {
                    el.focus();
                  }
                  this._el = el
                }}
              className={classnames('w-100', this.props.className)}
              onMouseUp={e => e.stopPropagation()}
              onFocus={(e) => {
                  this.startEdit(e);
                }}
              onBlur={e => this.submit(e.target.value)}
              onChange={this.onChange}
              type="text"
              value={value}
          />
          {autoComplete}
        </div>
      );
    }
  },
});

export default TextField;
