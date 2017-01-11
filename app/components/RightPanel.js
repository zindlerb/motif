import React from 'react';
import _ from 'lodash';
import { actionDispatch } from '../stateManager';

import HorizontalSelect from './HorizontalSelect';
import AttributeField from './AttributeField';
import ComponentTree from './ComponentTree';

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
      tree,
      otherPossibleTreeViewDropSpots,
      selectedTreeViewDropSpot
    } = this.props;

    if (this.props.activePanel === 'ATTRIBUTES' && activeComponent) {
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
          <button
              onClick={() => {
                  actionDispatch.createComponentBlock(activeComponent);
                }}>
            Make Component Block
          </button>
          {attrs}
        </div>
      );
    } else if (this.props.activePanel === 'TREE') {
      body = (<ComponentTree
                 node={tree}
                 otherPossibleTreeViewDropSpots={otherPossibleTreeViewDropSpots}
                 selectedTreeViewDropSpot={selectedTreeViewDropSpot}
                 activeComponent={activeComponent}
      />);
    }


    return (
      <div>
        <HorizontalSelect options={iconList} activePanel={this.props.activePanel} onClick={(name) => { actionDispatch.changePanel(name, 'right'); }} />
        {body}
      </div>
    );
  },
});

export default RightPanel;
