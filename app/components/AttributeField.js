import React from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import { ChromePicker } from 'react-color';
import {
  TEXT_FIELD,
  NUMBER,
  COLOR,
  DROPDOWN,
  attributeFieldset,
} from '../base_components.js';
import { actionDispatch } from '../stateManager.js';

const TextInput = React.createClass({
  getInitialState() {
    return {
      isEditing: false,
      tempText: '',
    };
  },
  startEdit() {
    this.setState({
      isEditing: true,
      tempText: this.props.value,
    });
  },
  onChange(e) {
    this.setState({ tempText: e.target.value });
  },
  submit(e) {
    this.setState({
      isEditing: false,
      tempText: '',
    });
    actionDispatch.setComponentAttribute(this.props.component, this.props.attrKey, e.target.value);
  },
  render() {
    const value = this.state.isEditing ? this.state.tempText : this.props.value;

    return <input onFocus={this.startEdit} onBlur={this.submit} onChange={this.onChange} type="text" value={value} />;
  },
});

const Dropdown = React.createClass({
  onChange(e) {
    actionDispatch.setComponentAttribute(this.props.component, this.props.attrKey, e.target.value);
  },
  render() {
    const choices = _.map(this.props.choices, function (choice) {
      let value,
        text;

      if (_.isString(choice)) {
        value = choice;
        text = choice;
      } else {
        value = choice.value;
        text = choice.text;
      }

      return <option value={value}>{text}</option>;
    });

    return (
      <select value={this.value} onChange={this.onChange}>
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
    actionDispatch.setComponentAttribute(this.props.component, this.props.attrKey, color.hex);
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

const AttributeField = React.createClass({
  render() {
    let { attrKey, attrVal, component } = this.props;
    let field;

    let fieldSet = {
      fieldType: TEXT_FIELD,
    };

    if (attributeFieldset[attrKey]) {
      fieldSet = attributeFieldset[attrKey];
    }

    if (fieldSet.fieldType === TEXT_FIELD) {
      field = <TextInput value={attrVal} attrKey={attrKey} component={component} />;
    } else if (fieldSet.fieldType === DROPDOWN) {
      field = <Dropdown value={attrVal} attrKey={attrKey} choices={fieldSet.fieldSettings.choices} component={component} />;
    } else if (fieldSet.fieldType === COLOR) {
      field = <ColorPicker value={attrVal} attrKey={attrKey} component={component} />;
    } else {
      field = <TextInput value={attrVal} attrKey={attrKey} component={component} />;
    }

    return (
      <div>
        <span>{attrKey}:</span>
        {field}
      </div>
    );
  },
});

export default AttributeField;
