import React from 'react';
import _ from 'lodash';
import {dragManager} from '../dragManager.js';
import classnames from 'classnames';
import $ from 'jquery';
import {actionDispatch} from '../stateManager.js';

import HorizontalSelect from './HorizontalSelect.js';
import AttributeField from './AttributeField.js';
import ComponentTree from './ComponentTree.js';

var iconList = [
  {name: "ATTRIBUTES", faClass: "fa-table"},
  {name: "TREE", faClass: "fa-tree"},
  {name: "DETAILS", faClass: "fa-info-circle"}
];

var RightPanel = React.createClass({
  render: function () {
    var body;
    var {activeComponent, tree} = this.props;
    if (this.props.activePanel === "ATTRIBUTES" && activeComponent) {
      body = [];
      _.forEach(activeComponent.getAllAttrs(), (attrVal, attrKey) => {
        body.push(
          <AttributeField component={activeComponent} attrKey={attrKey} attrVal={attrVal}/>
        );
      });
    } else if (this.props.activePanel === "TREE") {
      body = <ComponentTree node={tree} />
    }


    return (
      <div>
        <HorizontalSelect options={iconList} activePanel={this.props.activePanel} onClick={(name) => {actionDispatch.changePanel(name, "right")}} />
        {body}
      </div>
    );
  }
});

export default RightPanel;
