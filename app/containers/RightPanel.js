import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
  HOVER,
  DEFAULT,
  componentTypes,
} from '../base_components';

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
      componentTreeId,
      activeComponentId,
      hoveredComponentId,
      activePanel,
      otherPossibleTreeViewDropSpots,
      selectedTreeViewDropSpot,
      activeComponentState,
      currentPage
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
                  { text: 'Default', value: DEFAULT },
                  { text: 'Hover', value: HOVER }
                ]}
                onChange={(val) => { this.props.actions.setActiveComponentState(val) }}
                value={activeComponentState} />
          </div>
          {attrs}
        </div>
      );
    } else if (activePanel === 'TREE') {
      body = (
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
    activeComponentState: state.activeComponentState,
    activePanel: state.activeRightPanel,
    otherPossibleTreeViewDropSpots: state.otherPossibleTreeViewDropSpots,
    selectedTreeViewDropSpot: state.selectedTreeViewDropSpot
  }
}, null, null, { pure: false })(RightPanel);
