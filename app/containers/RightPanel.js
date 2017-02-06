import React from 'react';
import $ from 'jquery';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
  componentTypes,
} from '../base_components';
import {
  fieldTypes,
  stateTypes,
  breakpointTypes,
  NONE
} from '../constants';

import Dropdown from '../components/forms/Dropdown';
import SidebarHeader from '../components/SidebarHeader';
import HorizontalSelect from '../components/HorizontalSelect';
import AttributeField from '../components/AttributeField';
import ComponentTree from '../components/ComponentTree';
import CartoonButton from '../components/CartoonButton';

import FormLabel from '../components/forms/FormLabel';
import TextField from '../components/forms/TextField';

const iconList = [
  { name: 'ATTRIBUTES', faClass: 'fa-table' },
  { name: 'TREE', src: 'public/img/assets/tree-icon.svg' },
  { name: 'DETAILS', faClass: 'fa-info-circle' },
];

const {
  LARGE_TEXT,
  NUMBER,
  COLOR,
  DROPDOWN
} = fieldTypes;

//TD: Remove this.
//This whole thing is a hack to get around css
const DivToBottom = React.createClass({
  getInitialState() {
    return {
      height: undefined
    }
  },

  componentDidMount() {
    const resize = _.debounce(() => {
      this.setState(
        { height: this.getHeight() }
      );
    }, 500);

    this.setState({ height: this.getHeight() });
    window.addEventListener('resize', resize);
  },

  getHeight() {
    return document.documentElement.clientHeight - $(this._el).offset().top;
  },

  render() {
    return (
      <div
          ref={(el) => { this._el = el }}
          className={this.props.className}
          style={{ height: this.state.height }}
      >
        {this.props.children}
      </div>
    )
  }
});

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

const RightPanel = React.createClass({
  render() {
    let body, attrs;
    let {
      actions,
      siteComponents,
      componentTreeId,
      activeComponentId,
      hoveredComponentId,
      activePanel,
      otherPossibleTreeViewDropSpots,
      selectedTreeViewDropSpot,
      activeComponentState,
      activeComponentBreakpoint,
      currentPage,
    } = this.props;

    if (activePanel === 'ATTRIBUTES' && activeComponentId) {
      attrs = [];
      let activeComponent = siteComponents.components[activeComponentId];
      let componentAttrs = siteComponents.getAttributes(
        activeComponentId,
        {
          state: activeComponentState,
          breakpoint: activeComponentBreakpoint
        }
      );

      _.forEach(fields[activeComponent.componentType], (field) => {
        attrs.push(
          (<AttributeField
               actions={actions}
               fieldData={field}
               component={activeComponent}
               attrKey={field.key}
               attrVal={componentAttrs[field.key]}
               key={field.name}
           />)
        );
      });

      body = (
        <DivToBottom className="overflow-auto">
          <SidebarHeader text="Attributes" />
          <div className="tc mb3 mt2">
            <span>Name: {siteComponents.getName(activeComponentId)}</span>
            <CartoonButton
                onClick={() => {
                    this.props.actions.createComponentBlock(activeComponentId);
                  }}
                text="Make Component"
            />
            <CartoonButton
                onClick={() => { this.props.actions.syncComponent(activeComponentId); }}
                text="Sync"
            />
            <span>State:</span>
            <Dropdown
                choices={[
                  { text: 'None', value: NONE },
                  { text: 'Hover', value: stateTypes.HOVER }
                ]}
                onChange={(val) => {
                    this.props.actions.setActiveComponentState(val);
                  }}
                value={activeComponentState} />
            <span>Breakpoint:</span>
            <Dropdown
                choices={[
                  { text: 'None', value: NONE },
                  { text: 'Medium (30em - 60em)', value: breakpointTypes.MEDIUM },
                  { text: 'Large (> 60em)', value: breakpointTypes.LARGE }
                ]}
                onChange={(val) => {
                    this.props.actions.setActiveComponentBreakpoint(val);
                  }}
                value={activeComponentBreakpoint} />
          </div>
          {attrs}
        </DivToBottom>
      );
    } else if (activePanel === 'TREE') {
      body = (
        <div>
          <SidebarHeader text="Component Tree" />
          <ComponentTree
              node={siteComponents.getRenderTree(componentTreeId)}
              actions={this.props.actions}
              context={{
                otherPossibleTreeViewDropSpots,
                selectedTreeViewDropSpot,
                activeComponentId,
                hoveredComponentId,
              }}
          />
        </div>
      );
    } else if (activePanel === 'DETAILS') {
      const inputs = [
        { name: 'name', key: 'metaName' },
        { name: 'url', key: 'url' },
        { name: 'author', key: 'author' },
        { name: 'title', key: 'title' },
        { name: 'description', key: 'description', large: true },
        { name: 'keywords', key: 'keywords', large: true },
      ].map((input) => {
        return (
          <FormLabel name={input.name}>
            <TextField
                value={currentPage[input.key]}
                onSubmit={(value) => {
                    this.props.actions.setPageValue(input.key, value);
                  }}
                isLarge={input.large}
            />
          </FormLabel>
        );
      });

      body = (
        <div>
          <SidebarHeader text="Page Settings" />
          { inputs }
        </div>
      );
    }

    return (
      <div>
        <HorizontalSelect
            className="w-100"
            options={iconList}
            activePanel={this.props.activePanel}
            onClick={(name) => { this.props.actions.changePanel(name, 'right'); }}
        />
        <div className="ph1">
          {body}
        </div>
      </div>
    );
  },
});

export default connect(function (state) {
  const currentPage = _.find(
    state.pages,
    page => page.id === state.currentPageId
  );

  return {
    currentPage,
    siteComponents: state.siteComponents,
    activeComponentId: state.activeComponentId,
    hoveredComponentId: state.hoveredComponentId,
    componentTreeId: currentPage.componentTreeId,
    activePanel: state.activeRightPanel,
    otherPossibleTreeViewDropSpots: state.otherPossibleTreeViewDropSpots,
    selectedTreeViewDropSpot: state.selectedTreeViewDropSpot,
    activeComponentState: state.activeComponentState,
    activeComponentBreakpoint: state.activeComponentBreakpoint
  }
}, null, null, { pure: false })(RightPanel);
