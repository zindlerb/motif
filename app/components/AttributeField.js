import React from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import { ChromePicker } from 'react-color';
import {
  COLOR,
  DROPDOWN,
} from '../base_components';

const TextInput = React.createClass({
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
    this.props.actions.setComponentAttribute(
      this.props.component,
      this.props.attrKey,
      e.target.value
    );
  },
  render() {
    const { isEditing, tempText } = this.state
    const value = isEditing ? tempText : this.props.value;

    return (<input
                className="w-100"
                onMouseUp={e => e.stopPropagation()}
                onFocus={this.startEdit}
                onBlur={this.submit}
                onChange={this.onChange}
                type="text"
                value={value}
    />);
  },
});

const Dropdown = React.createClass({
  onChange(e) {
    this.props.actions.setComponentAttribute(
      this.props.component,
      this.props.attrKey,
      e.target.value
    );
  },
  render() {
    const choices = _.map(this.props.choices, function (choice, ind) {
      let value,
        text;

      if (_.isString(choice)) {
        value = choice;
        text = choice;
      } else {
        value = choice.value;
        text = choice.text;
      }

      return <option value={value} key={ind}>{text}</option>;
    });

    return (
      <select className="w-100" value={this.value} onChange={this.onChange}>
        {choices}
      </select>
    );
  },
});

const ColorPicker = React.createClass({
  getInitialState() {
    return {
      isOpen: false,
    };
  },

  onChange(color) {
    this.props.actions.setComponentAttribute(this.props.component, this.props.attrKey, color.hex);
  },

  render() {
    const { value } = this.props;
    let picker;
    let color = value;

    if (value === 'transparent') {
      color = 'white';
    }

    const sx = {
      backgroundColor: color,
      width: 60,
      height: 20,
    };

    if (this.state.isOpen) {
      picker = <ChromePicker color={color} onChange={this.onChange} />;
    }

    return (
      <div>
        <div onClick={() => { this.setState({ isOpen: !this.state.isOpen }); }} className={classnames('colorDisplay', 'ba')} style={sx} />
        {picker}
      </div>
    );
  },
});

const AttributeField = function (props) {
  let { attrKey, attrVal, component, fieldData } = props;
  let field;

  if (fieldData.fieldType === DROPDOWN) {
    field = (<Dropdown
                 value={attrVal}
                 attrKey={attrKey}
                 choices={fieldData.choices}
                 component={component}
    />);
  } else if (fieldData.fieldType === COLOR) {
    field = <ColorPicker value={attrVal} attrKey={attrKey} component={component} />;
  } else {
    field = <TextInput value={attrVal} attrKey={attrKey} component={component} />;
  }

  return (
    <div className="mb2">
      <div className="mb1">
        <span className="f7">{attrKey}:</span>
      </div>
      {field}
    </div>
  );
};

export default AttributeField;
