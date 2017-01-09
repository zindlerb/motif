import React from 'react';
import _ from 'lodash';
import { dragManager } from '../dragManager.js';
import classnames from 'classnames';
import $ from 'jquery';
import { actionDispatch } from '../stateManager.js';

import HorizontalSelect from './HorizontalSelect.js';
import AttributeField from './AttributeField.js';
import ComponentTree from './ComponentTree.js';

const iconList = [
  { name: 'ATTRIBUTES', faClass: 'fa-table' },
  { name: 'TREE', faClass: 'fa-tree' },
  { name: 'DETAILS', faClass: 'fa-info-circle' },
];

const RightPanel = React.createClass({
  render() {
    let body, attrs;
    let { activeComponent, tree, treeDropPoints, treeSelectedDropPoint } = this.props;
    if (this.props.activePanel === 'ATTRIBUTES' && activeComponent) {
      attrs = [];
      _.forEach(activeComponent.getAllAttrs(), (attrVal, attrKey) => {
        attrs.push(
          <AttributeField component={activeComponent} attrKey={attrKey} attrVal={attrVal} key={attrKey} />,
        );
      });

      body = (
        <div>
          <button onClick={() => { actionDispatch.createComponentBlock(activeComponent)}}>Make Component Block</button>
          {attrs}
        </div>
      )
    } else if (this.props.activePanel === 'TREE') {
      body = <ComponentTree
                 node={tree}
                 treeDropPoints={treeDropPoints}
                 treeSelectedDropPoint={treeSelectedDropPoint}
                 activeComponent={activeComponent}
             />;
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
