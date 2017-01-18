import React from 'react';
import _ from 'lodash';
import { actionDispatch } from '../stateManager';

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
      activePanel,
      tree,
      otherPossibleTreeViewDropSpots,
      selectedTreeViewDropSpot
    } = this.props;

    if (activePanel === 'ATTRIBUTES' && activeComponent) {
      attrs = [];
      _.forEach(activeComponent.getAllAttrs(), (attrVal, attrKey) => {
        attrs.push(
          (<AttributeField
               component={activeComponent}
               attrKey={attrKey}
               attrVal={attrVal}
               key={attrKey}
           />)
        );
      });

      body = (
        <div>
          <SidebarHeader text="Attributes"/>
          <div className="tc mb3 mt2">
            <CartoonButton
                onClick={() => { actionDispatch.createComponentBlock(activeComponent); }}
                text="Make Component Block"
            />
          </div>
          {attrs}
        </div>
      );
    } else if (activePanel === 'TREE') {
      body = (<ComponentTree
                 node={tree}
                 otherPossibleTreeViewDropSpots={otherPossibleTreeViewDropSpots}
                 selectedTreeViewDropSpot={selectedTreeViewDropSpot}
                 activeComponent={activeComponent}
      />);
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
