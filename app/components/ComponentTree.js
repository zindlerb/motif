import React from 'react';
import _ from 'lodash';
import dragManager from '../dragManager.js';
import classnames from 'classnames';
import $ from 'jquery';

var ComponentTree = React.createClass({
  render: function() {
    var children;
    
    if (this.props.node.children && this.props.node.children.length) {
      children = <TreeChildren children={this.props.node.children}/>;
    }
    
    return (
      <div>
        <TreeItem node={this.props.node} />
        {children}
      </div>
    )
  }
});

var TreeItem = React.createClass({
  render: function() {
    return <span className={classnames(
        "mb2 outline_" + this.props.node.id,
        {
          highlightBottom: stateManager.state.dropHighlightId === this.props.node.id
        },
        stateManager.state.highlightType,
        "db"
      )}>{this.props.node.name}</span>
  }
});

var TreeChildren = React.createClass({
  render: function() {
    var children = _.map(this.props.children, function(child, ind) {
      return <ComponentTree node={child} key={ind}/>
    });
    
    return (
      <div className="ml3">
        {children}
      </div>
    )
  }
});

export default ComponentTree;
