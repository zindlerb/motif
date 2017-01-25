import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { actionDispatch } from '../stateManager';
import {
  HOVER,
  DEFAULT,
  componentTypes
} from '../base_components';

import Dropdown from './forms/Dropdown';
import SidebarHeader from './SidebarHeader';
import HorizontalSelect from './HorizontalSelect';
import AttributeField from './AttributeField';
import ComponentTree from './ComponentTree';
import CartoonButton from './CartoonButton';

const iconList = [
  { name: 'ATTRIBUTES', faClass: 'fa-table' },
  { name: 'TREE', faClass: 'fa-tree' },
  { name: 'DETAILS', faClass: 'fa-info-circle' },
];

/* Field Types */
export const TEXT_FIELD = 'TEXT_FIELD'; /* fieldSettings:  */
export const LARGE_TEXT_FIELD = 'LARGE_TEXT_FIELD'; /* fieldSettings:  */
export const NUMBER = 'NUMBER'; /* fieldSettings: eventually allow for multi-value */
export const COLOR = 'COLOR'; /* fieldSettings:  */
export const DROPDOWN = 'DROPDOWN'; /* fieldSettings: choices - {name: , value: } */
export const TOGGLE = 'TOGGLE'; /*  */

const defaultFields = [
  { name: 'position', fieldType: DROPDOWN, choices: ['static', 'absolute'] },
  { name: 'margin', fieldType: TEXT_FIELD },
  { name: 'padding', fieldType: TEXT_FIELD },
  { name: 'height', fieldType: TEXT_FIELD },
  { name: 'width', fieldType: TEXT_FIELD },
  { name: 'backgroundColor', fieldType: COLOR },
];

const fields = {
  [componentTypes.CONTAINER]: [
    ...defaultFields,
    { name: 'flexDirection', fieldType: DROPDOWN, choices: ['row', 'column'] },
    {
      name: 'justifyContent',
      fieldType: DROPDOWN,
      choices: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around']
    },
    {
      name: 'alignItems',
      fieldType: DROPDOWN,
      choices: ['flex-start', 'flex-end', 'center', 'baseline', 'stretch']
    }
  ],
  [componentTypes.HEADER]: [
    ...defaultFields,
    { name: 'text', fieldType: TEXT_FIELD }
  ],
  [componentTypes.TEXT]: [
    ...defaultFields,
    { name: 'text', fieldType: TEXT_FIELD }
  ],
  [componentTypes.IMAGE]: [
    ...defaultFields,
    { name: 'src', fieldType: TEXT_FIELD }
  ]
}

const RightPanel = React.createClass({
  render() {
    let body, attrs;
    let {
      siteComponents,
      rootTreeId,
      activeComponentId,
      hoveredComponentId,
      activePanel,
      otherPossibleTreeViewDropSpots,
      selectedTreeViewDropSpot,
      activeComponentState,
    } = this.props;

    if (activePanel === 'ATTRIBUTES' && activeComponentId) {
      attrs = [];
      let activeComponent = siteComponents.components[activeComponentId];
      let componentAttrs = siteComponents.getStateAttributes(
        activeComponentId,
        activeComponentState
      );

      _.forEach(fields[activeComponent.componentType], (field) => {
        attrs.push(
          (<AttributeField
               fieldData={field}
               component={activeComponent}
               attrKey={field.name}
               attrVal={componentAttrs[field.name]}
               key={field.name}
           />)
        );
      });

      body = (
        <div>
          <SidebarHeader text="Attributes" />
          <div className="tc mb3 mt2">
            <span>Name: {siteComponents.getName(activeComponentId)}</span>
            <CartoonButton
                onClick={() => { actionDispatch.createComponentBlock(activeComponentId); }}
                text="Make Component"
            />
            <CartoonButton
                onClick={() => { actionDispatch.syncComponent(activeComponentId); }}
                text="Sync"
            />
            <span>State:</span>
            <Dropdown
                choices={[
                  { text: 'Default', value: DEFAULT },
                  { text: 'Hover', value: HOVER }
                ]}
                onChange={(val) => { actionDispatch.setActiveComponentState(val) }}
                value={activeComponentState} />
          </div>
          {attrs}
        </div>
      );
    } else if (activePanel === 'TREE') {
      body = (
        <ComponentTree
            node={siteComponents.getRenderTree(rootTreeId)}
            context={{
              otherPossibleTreeViewDropSpots,
              selectedTreeViewDropSpot,
              activeComponentId,
              hoveredComponentId,
            }}
        />
      );
    } else if (activePanel === 'DETAILS') {
      body = (<SidebarHeader text="Page Settings" />);
    }

    return (
      <div>
        <HorizontalSelect
            className="w-100"
            options={iconList}
            activePanel={this.props.activePanel}
            onClick={(name) => { actionDispatch.changePanel(name, 'right'); }}
        />
        <div className="ph1">
          {body}
        </div>
      </div>
    );
  },
});

export default connect(function (state) {
  return {
    siteComponents: state.siteComponents,
    activeComponentId: state.activeComponentId,
    hoveredComponentId: state.hoveredComponentId,
    rootTreeId: state.currentPage.componentTreeId,
    activeComponentState: state.activeComponentState,
    activePanel: state.activeRightPanel,
    otherPossibleTreeViewDropSpots: state.otherPossibleTreeViewDropSpots,
    selectedTreeViewDropSpot: state.selectedTreeViewDropSpot
  }
}, null, null, { pure: false })(RightPanel);
