import React from 'react';
import classnames from 'classnames';
import { ChromePicker } from 'react-color';
import { fieldTypes } from '../constants';
import TextField from './forms/TextField';
import Dropdown from './forms/Dropdown';
import FormLabel from './forms/FormLabel';

/*
   AutoCompletes are in all attribute fields
   Usage of attribute field means providing options for dropdown

   internally handles location in attributeField
   selection sets the attribute to the given value of the item
 */

const ColorPicker = React.createClass({
  getInitialState() {
    return {
      isOpen: false,
    };
  },

  onChange(color) {
    this.props.onChange(color.hex);
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

function fieldKeyToName(key) {
  return key.replace(/([A-Z])/g, ' $1').toLowerCase();
}

const AttributeField = React.createClass({
  render() {
    let {
      attrVal,
      componentId,
      fieldData,
      actions
    } = this.props;
    let field, autoComplete;
    let attrKey = fieldData.key;

    if (fieldData.fieldType === fieldTypes.DROPDOWN) {
      field = (<Dropdown
                   value={attrVal}
                   attrKey={attrKey}
                   choices={fieldData.choices}
                   onChange={(val) => {
                       actions.setComponentAttribute(
                         componentId,
                         attrKey,
                         val
                       );
                     }}
               />);
    } else if (fieldData.fieldType === fieldTypes.COLOR) {
      field = (
        <ColorPicker
            value={attrVal}
            attrKey={attrKey}
            onChange={(color) => {
                actions.setComponentAttribute(
                  componentId,
                  attrKey,
                  color
                );
              }}
        />
      );
    } else if (fieldData.fieldType === fieldTypes.NUMBER || fieldData.fieldType === fieldTypes.TEXT) {
      field = (
        <TextField
            value={attrVal}
            attrKey={attrKey}
            autoCompleteItems={fieldData.autoCompleteItems}
            onSubmit={(value) => {
                actions.setComponentAttribute(
                  componentId,
                  attrKey,
                  value
                );
              }}
        />);
    } else if (fieldData.fieldType === fieldTypes.LARGE_TEXT) {
      field = (
        <TextField
            value={attrVal}
            attrKey={attrKey}
            isLarge={true}
            onSubmit={(value) => {
                actions.setComponentAttribute(
                  componentId,
                  attrKey,
                  value
                );
              }}
        />);
    } else {
      throw new Error('Unsupported field type ' + fieldData.fieldType);
    }

    return (
      <div>
        <FormLabel name={fieldData.name || fieldKeyToName(fieldData.key)}>
          {field}
        </FormLabel>
        {autoComplete}
      </div>
    );
  }
});

export default AttributeField;
