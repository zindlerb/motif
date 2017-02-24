import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { ComponentsContainer } from '../base_components';
import AttributeField from '../components/AttributeField';
import DivToBottom from '../components/DivToBottom';
import SidebarHeader from '../components/SidebarHeader';
import CartoonButton from '../components/CartoonButton';
import Dropdown from '../components/forms/Dropdown';
import { createImmutableJSSelector } from '../utils';
import {
  fieldTypes,
  componentTypes,
  NONE,
  stateTypes,
  breakpointTypes
} from '../constants';

/*
   What does a validation consist of?

   valid color types:
   #ff0000;
   rgb(255, 0, 0);
   rgba(255, 0, 0, 0.3);
   hsl(120, 100%, 50%);


   - a check against the string determining if it is valid
   - a error message - error message could also take string and be dependent on it? or

   const validations = {
   [NUMBER]: {
   check(str) {

   },
   errorMsg(str) {
   // no unit
   // invalid number
   }
   },

   [COLOR]: {
   check(str) {

   },
   errorMsg: 'Invalid color format. '
   },
   }
 */

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
      /*
         Too big and depends on user fonts so dynamically added later.
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
}

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
}

const Attributes = function (props) {
  const {
    componentName,
    componentType,
    attributes,
    componentId,
    componentState,
    componentBreakpoint,
    actions,
  } = props;

  //console.log('ATTRIBUTES RENDER');

  let body, attributeFields = []

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

    body = (
      <div className="ph2">
        <div className="mb3 mt2">
          <div className="tc">
            <span className="mv2 dib f5">{componentName}</span>
          </div>
          <div className="mb3 tc">
            <CartoonButton
                className="mr1"
                onClick={() => {
                    props.actions.createComponentBlock(componentId);
                  }}
                text="Make Component"
            />
            <CartoonButton
                onClick={() => { props.actions.syncComponent(componentId); }}
                text="Sync"
            />
          </div>
          <span className="mb2 dib">State:</span>
          <Dropdown
              className="state-dropdown fr"
              choices={[
                { text: 'None', value: NONE },
                { text: 'Hover', value: stateTypes.HOVER }
              ]}
              onChange={(val) => {
                  props.actions.setActiveComponentState(val);
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
                  props.actions.setActiveComponentBreakpoint(val);
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

const attributesSelector = createImmutableJSSelector(
  [
    state => state.get('componentsMap'),
    state => state.get('activeComponentId'),
    state => state.get('activeComponentState'),
    state => state.get('activeComponentBreakpoint'),
  ],
  (componentsMap, activeComponentId,
   activeComponentState, activeComponentBreakpoint) => {
     if (activeComponentId) {
       return {
         componentName: ComponentsContainer.getName(
           componentsMap,
           activeComponentId
         ),
         componentType: componentsMap.getIn([
           activeComponentId,
           'componentType'
         ]),
         attributes: ComponentsContainer.getAttributes(
           componentsMap,
           activeComponentId,
           componentsMap,
           {
             state: activeComponentState,
             breakpoint: activeComponentBreakpoint,
           }),
         componentId: activeComponentId,
         componentState: activeComponentState,
         componentBreakpoint: activeComponentBreakpoint,
       }
     } else {
       return {};
     }
  }
)

export default connect(attributesSelector)(Attributes);
