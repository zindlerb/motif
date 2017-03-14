import React from 'react';
import _ from 'lodash';

import AttributeField from '../components/AttributeField';
import DivToBottom from '../components/DivToBottom';
import CartoonButton from '../components/CartoonButton';
import TextField from '../components/forms/TextField';
import {
  fieldTypes,
  componentTypes,
} from '../constants';

const {
  LARGE_TEXT,
  TEXT,
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
  position: { key: 'position', fieldType: DROPDOWN, choices: ['static'] },
  margin: {
    fieldType: NUMBER,
    autoCompleteItems: spacingScale
  },
  flexWrap: {
    fieldType: DROPDOWN,
    choices: [
      'nowrap',
      'wrap',
      'wrap-reverse'
    ],
    defaultValue: 'nowrap'
  },
  textDecoration: {
    fieldType: DROPDOWN,
    choices: [
      'none',
      'underline',
      'overline',
      'line-through'
    ],
    defaultValue: 'none'
  },
  padding: {
    fieldType: NUMBER,
    autoCompleteItems: spacingScale
  },
  height: {
    fieldType: NUMBER,
    autoCompleteItems: heightScale
  },
  minHeight: {
    fieldType: NUMBER,
    autoCompleteItems: heightScale
  },
  maxHeight: {
    fieldType: NUMBER,
    autoCompleteItems: heightScale
  },
  width: {
    fieldType: NUMBER,
    autoCompleteItems: widthScale
  },
  minWidth: {
    fieldType: NUMBER,
    autoCompleteItems: heightScale
  },
  maxWidth: {
    fieldType: NUMBER,
    autoCompleteItems: heightScale
  },
  backgroundColor: { fieldType: COLOR },
  flexDirection: {
    fieldType: DROPDOWN,
    choices: ['none', 'row', 'column', 'row-reverse', 'column-reverse'],
    defaultValue: 'row'
  },
  opacity: { fieldType: NUMBER },
  justifyContent: {
    fieldType: DROPDOWN,
    choices: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around'],
    defaultValue: 'flex-start'
  },
  alignItems: {
    fieldType: DROPDOWN,
    choices: ['flex-start', 'flex-end', 'center', 'baseline', 'stretch'],
    defaultValue: 'stretch'
  },
  text: { fieldType: LARGE_TEXT },
  listItems: { fieldType: LARGE_TEXT },
  borderWidth: {
    fieldType: NUMBER,
  },
  borderColor: {
    fieldType: COLOR
  },
  borderRadius: {
    fieldType: NUMBER
  },
  verticalAlign: {
    fieldType: DROPDOWN,
    choices: [
      'baseline',
      'top',
      'middle',
      'bottom'
    ],
    defaultValue: 'baseline'
  },
  borderStyle: {
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
    ],
    defaultValue: 'none'
  },
  overflow: {
    fieldType: DROPDOWN,
    choices: [
      'visible',
      'hidden',
      'scroll',
      'auto'
    ],
    defaultValue: 'visible'
  },
  display: {
    fieldType: DROPDOWN,
    choices: [
      'flex', // TD: should be conditional
      'inline',
      'inline-block',
      'block',
    ],
    defaultValue: 'block'
  },
  fontFamily: {
    fieldType: DROPDOWN,
    choices: [
      'Arial',
      'Helvetica',
      'Sans-serif',
      'Georgia',
      'Serif',
      'Courier',
      'Monospace',
      'Monaco',
      'Fira Sans',
      'Playfair Display'
      /*
         TD: Allow import of fonts through goog fonts. And font search
       */
    ],
    defaultValue: 'Fira Sans'
  },
  listStyleType: {
    fieldType: DROPDOWN,
    choices: [
      'none',
      'disc',
      'circle',
      'square',
      'decimal',
    ],
    defaultValue: 'none'
  },
  fontStyle: {
    key: 'fontStyle',
    fieldType: DROPDOWN,
    choices: [
      'normal',
      'italic',
      'oblique'
    ],
    defaultValue: 'normal'
  },
  fontSize: {
    fieldType: NUMBER
  },
  fontWeight: {
    fieldType: NUMBER
  },
  textAlign: {
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
    ],
    defaultValue: 'start'
  },
  href: {
    fieldType: TEXT
  },
  lineHeight: {
    fieldType: NUMBER
  },
  color: {
    fieldType: COLOR
  }
};

_.mapValues(allFields, (val, key) => {
  val.key = key;
  return val;
});

const textFields = [
  allFields.fontFamily,
  allFields.fontStyle,
  allFields.fontSize,
  allFields.fontWeight,
  allFields.textAlign,
  allFields.lineHeight,
  allFields.textDecoration,
  allFields.color,
];

const defaultFields = [
  allFields.verticalAlign,
  allFields.opacity,
  allFields.display,
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
    allFields.flexWrap,
    allFields.justifyContent,
    allFields.alignItems,
    allFields.listStyleType,
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
  ],
  [componentTypes.LINK]: [
    ...defaultFields,
    ...textFields,
    allFields.href,
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
      isDefaultComponent,
      isSynced,
      isRoot,
      actions
    } = this.props;

    let body, attributeFields = [], buttons;

    if (componentId) {
      _.forEach(fields[componentType], (field) => {
        attributeFields.push(
          (<AttributeField
               actions={actions}
               fieldData={field}
               componentId={componentId}
               attrVal={attributes[field.key] || field.defaultValue || ''}
               key={field.key}
           />)
        );
      });

      if (this.props.showButtons) {
        buttons = (
          <div className="mb3 tc">
            <CartoonButton
                className="mr1"
                disabled={isRoot}
                onClick={() => {
                    actions.createComponentBlock(componentId);
                    this.setState({ isEditing: true });
                  }}
                text="Make Component"
            />
            <CartoonButton
                onClick={() => { actions.syncComponent(componentId); }}
                disabled={isSynced && !isDefaultComponent}
                text="Sync"
            />
          </div>
        );
      }
      let masterName;
      if (this.state.isEditing) {
        masterName = (
          <TextField
              className="mv2 dib f5"
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
              className="mv2 dib f5 clickable"
              onClick={() => this.setState({ isEditing: true })}>
              {componentName}
          </span>
        );
      }

/*
   State and breakpoint dropdowns

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
*/

      body = (
        <div className="ph2">
          <div className="mb3 mt2">
            <div className="tc">
              { masterName }
            </div>
            { buttons }
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
