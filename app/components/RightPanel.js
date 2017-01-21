import React from 'react';
import _ from 'lodash';
import { actionDispatch } from '../stateManager';
import { HOVER, DEFAULT } from '../base_components';

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

const RightPanel = React.createClass({
  render() {
    let body, attrs;
    let {
      activeComponent,
      hoveredComponent,
      activePanel,
      tree,
      otherPossibleTreeViewDropSpots,
      selectedTreeViewDropSpot,
      activeComponentState,
      assets
    } = this.props;

    if (activePanel === 'ATTRIBUTES' && activeComponent) {
      attrs = [];
      let componentAttrs = activeComponent.getAllAttrs(activeComponentState);
      _.forEach(activeComponent.fields, (field) => {
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
          <SidebarHeader text="Attributes"/>
          <div className="tc mb3 mt2">
            <span>Name: {activeComponent.getName()}</span>
            <CartoonButton
                onClick={() => { actionDispatch.createComponentBlock(activeComponent); }}
                text="Make Component"
            />
            <CartoonButton
                onClick={() => { actionDispatch.syncComponent(activeComponent); }}
                text="Sync"
            />
            <span>State:</span>
            <Dropdown
                choices={[
                  {text: 'Default', value: DEFAULT},
                  {text: 'Hover', value: HOVER}
                ]}
                onChange={(val) => { actionDispatch.setActiveComponentState(val) }}
                value={activeComponentState}/>
          </div>
          {attrs}
        </div>
      );
    } else if (activePanel === 'TREE') {
      body = (
        <ComponentTree
            node={tree}
            context={{
              otherPossibleTreeViewDropSpots,
              selectedTreeViewDropSpot,
              activeComponent,
              hoveredComponent,
            }}
        />
      );
    } else if (activePanel === 'DETAILS') {
      body = (<SidebarHeader text='Page Settings'/>);
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

export default RightPanel;
