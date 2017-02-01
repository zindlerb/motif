import React from 'react';
import classnames from 'classnames';
import { ChromePicker } from 'react-color';
import {
  COLOR,
  DROPDOWN,
} from '../base_components';
import TextField from './forms/TextField';
import Dropdown from './forms/Dropdown';
import FormLabel from './forms/FormLabel';

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
    field = (
      <TextField
          value={attrVal}
          attrKey={attrKey}
          onSubmit={(value) => {
              this.props.actions.setComponentAttribute(
                this.props.componentId,
                this.props.attrKey,
                value
              );
            }}
      />);
  }

  return (
    <FormLabel name={attrKey}>
      {field}
    </FormLabel>
  );
};

export default AttributeField;
