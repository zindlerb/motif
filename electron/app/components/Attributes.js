import React from 'react';
import _ from 'lodash';

import AttributeField from '../components/AttributeField';
import DivToBottom from '../components/DivToBottom';
import CartoonButton from '../components/CartoonButton';
import Dropdown from '../components/forms/Dropdown';
import TextField from '../components/forms/TextField';
import {
  fieldTypes,
  componentTypes,
  NONE,
  stateTypes,
  breakpointTypes
} from '../constants';

const {
  LARGE_TEXT,
  NUMBER,
  COLOR,
  DROPDOWN
} = fieldTypes;

const scale = [
  '.25rem',
  '.5rem',
  '1rem',
  '2rem',
  '4rem',
  '8rem',
  '16rem'
];

const spacingScale = scale.map((value, ind) => {
  return { value, name: 'spacing ' + ind };
});

const heightScale = scale.slice(2).map((value, ind) => {
  return { value, name: 'height ' + ind };
});

const widthScale = scale.slice(2).map((value, ind) => {
  return { value, name: 'width ' + ind };
});

const allFields = {
  position: { key: 'position', fieldType: DROPDOWN, choices: ['static', 'absolute'] },
  margin: {
    key: 'margin',
    fieldType: NUMBER,
    autoCompleteItems: spacingScale
  },
  padding: {
    key: 'padding',
    fieldType: NUMBER,
    autoCompleteItems: spacingScale
  },
  height: {
    key: 'height',
    fieldType: NUMBER,
    autoCompleteItems: heightScale
  },
  minHeight: {
    key: 'minHeight',
    fieldType: NUMBER,
    autoCompleteItems: heightScale
  },
  maxHeight: {
    key: 'maxHeight',
    fieldType: NUMBER,
    autoCompleteItems: heightScale
  },
  width: {
    key: 'width',
    fieldType: NUMBER,
    autoCompleteItems: widthScale
  },
  minWidth: {
    key: 'minWidth',
    fieldType: NUMBER,
    autoCompleteItems: heightScale
  },
  maxWidth: {
    key: 'maxWidth',
    fieldType: NUMBER,
    autoCompleteItems: heightScale
  },
  backgroundColor: { key: 'backgroundColor', fieldType: COLOR },
  flexDirection: { key: 'flexDirection', fieldType: DROPDOWN, choices: ['row', 'column'] },
  justifyContent: {
    key: 'justifyContent',
    fieldType: DROPDOWN,
    choices: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around']
  },
  alignItems: {
    key: 'alignItems',
    fieldType: DROPDOWN,
    choices: ['flex-start', 'flex-end', 'center', 'baseline', 'stretch']
  },
  text: { key: 'text', fieldType: LARGE_TEXT },
  borderWidth: {
    key: 'borderWidth',
    fieldType: NUMBER,
  },
  borderColor: {
    key: 'borderColor',
    fieldType: COLOR
  },
  borderRadius: {
    key: 'borderRadius',
    fieldType: NUMBER
  },
  borderStyle: {
    key: 'borderStyle',
    fieldType: DROPDOWN,
    choices: [
      'none',
      'hidden',
      'dotted',
      'dashed',
      'solid',
      'double',
      'groove',
      'ridge',
      'inset',
      'outset'
    ]
  },
  overflow: {
    key: 'overflow',
    fieldType: DROPDOWN,
    choices: [
      'visible',
      'hidden',
      'scroll',
      'auto'
    ]
  },
  fontFamily: {
    key: 'fontFamily',
    fieldType: DROPDOWN,
    choices: [
      'Arial',
      'Helvetica',
      'Sans-serif',
      'Georgia',
      'Serif',
      'Courier',
      'Monospace',
      'Monaco'
      /*
         TD: Allow import of fonts through goog fonts. And font search
       */
    ]
  },
  fontStyle: {
    key: 'fontStyle',
    fieldType: DROPDOWN,
    choices: [
      'normal',
      'italic',
      'oblique'
    ]
  },
  fontSize: {
    key: 'fontSize',
    fieldType: NUMBER
  },
  fontWeight: {
    key: 'fontWeight',
    fieldType: NUMBER
  },
  textAlign: {
    key: 'textAlign',
    fieldType: DROPDOWN,
    choices: [
      'left',
      'right',
      'center',
      'justify',
      'justify-all',
      'start',
      'end',
      'match-parent'
    ]
  },
  lineHeight: {
    key: 'lineHeight',
    fieldType: NUMBER
  },
  color: {
    key: 'color',
    fieldType: COLOR
  }
};

const textFields = [
  allFields.fontFamily,
  allFields.fontStyle,
  allFields.fontSize,
  allFields.fontWeight,
  allFields.textAlign,
  allFields.lineHeight,
  allFields.color
];

const defaultFields = [
  allFields.position,
  allFields.margin,
  allFields.padding,
  allFields.height,
  allFields.minHeight,
  allFields.maxHeight,
  allFields.width,
  allFields.minWidth,
  allFields.maxWidth,
  allFields.backgroundColor,
  allFields.borderWidth,
  allFields.borderStyle,
  allFields.borderColor,
  allFields.borderRadius
];

const fields = {
  [componentTypes.CONTAINER]: [
    ...defaultFields,
    allFields.flexDirection,
    allFields.justifyContent,
    allFields.alignItems,
    allFields.overflow
  ],
  [componentTypes.HEADER]: [
    ...defaultFields,
    allFields.text,
    ...textFields
  ],
  [componentTypes.TEXT]: [
    ...defaultFields,
    allFields.text,
    ...textFields
  ],
  [componentTypes.IMAGE]: [
    ...defaultFields,
    allFields.text
  ]
};

const Attributes = React.createClass({
  getInitialState() {
    return {
      tempText: '',
      isEditing: false
    }
  },
  render() {
    const {
      componentName,
      componentType,
      attributes,
      componentId,
      componentState,
      componentBreakpoint,
      actions,
    } = this.props;

    let body, attributeFields = [], buttons;

    if (componentId) {
      _.forEach(fields[componentType], (field) => {
        attributeFields.push(
          (<AttributeField
               actions={actions}
               fieldData={field}
               componentId={componentId}
               attrVal={attributes[field.key]}
               key={field.key}
           />)
        );
      });

      if (this.props.showButtons) {
        buttons = (
          <div className="mb3 tc">
            <CartoonButton
                className="mr1"
                onClick={() => {
                    actions.createComponentBlock(componentId);
                  }}
                text="Make Component"
            />
            <CartoonButton
                onClick={() => { actions.syncComponent(componentId); }}
                disabled={this.props.isSynced}
                text="Sync"
            />
          </div>
        );
      }
      let masterName;
      if (this.state.isEditing) {
        masterName = (
          <TextField
              autoFocus={true}
              value={componentName}
              onSubmit={(value) => {
                  this.setState({ isEditing: false });
                  actions.changeComponentName(componentId, value);
                }}
          />
        );
      } else {
        masterName = (
          <span
              onClick={() => this.setState({ isEditing: true })}>
            {componentName}
          </span>
        );
      }

      body = (
        <div className="ph2">
          <div className="mb3 mt2">
            <div className="tc">
              { masterName }
            </div>
            { buttons }
            <span className="mb2 dib">State:</span>
            <Dropdown
                className="state-dropdown fr"
                choices={[
                  { text: 'None', value: NONE },
                  { text: 'Hover', value: stateTypes.HOVER }
                ]}
                onChange={(val) => {
                    actions.setActiveComponentState(val);
                  }}
                value={componentState} />
            <span className="dib">Breakpoint:</span>
            <Dropdown
                className="state-dropdown fr"
                choices={[
                  { text: 'None', value: NONE },
                  { text: 'Medium (30em - 60em)', value: breakpointTypes.MEDIUM },
                  { text: 'Large (> 60em)', value: breakpointTypes.LARGE }
                ]}
                onChange={(val) => {
                    actions.setActiveComponentBreakpoint(val);
                  }}
                value={componentBreakpoint} />
          </div>
          {attributeFields}
        </div>
      );
    } else {
      body = (
        <div className="mt6 tc">
          <span className="hint f7 dib">Select a Component</span>
        </div>
      );
    }

    return (
      <DivToBottom className="overflow-auto">
        {body}
      </DivToBottom>
    );
  }
});

export default Attributes;
