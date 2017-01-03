import React from 'react';
import _ from 'lodash';
import { dragManager, createDraggableComponent } from '../dragManager.js';
import { actionDispatch } from '../stateManager.js';
import classnames from 'classnames';
import $ from 'jquery';

const Spacer = function () {
  const sx = {
    border: '1px solid orange',
    marginTop: 1,
    marginBottom: 1,
  };
  return (
    <div ref={(ref) => { }} style={sx} />
  );
};

const ComponentTree = React.createClass({
  render() {
    let children;
    let extraSpacer;

    if (this.props.node.children && this.props.node.children.length) {
      children = <TreeChildren children={this.props.node.children} />;
    }

    if (this.props.isFirstChild()) {
      extraSpacer = <Spacer />;
    }

    return (
      <div className="mt1">
        {extraSpacer}
        <TreeItem node={this.props.node} />
        {children}
        <Spacer />
      </div>
    );
  },
});

const TreeItem = createDraggableComponent(
  {
    dragType: 'moveComponent',
    onDrag(props, pos) {
      actionDispatch.setTreeMoveHighlight(pos);
    },
    onEnd(props) {
      actionDispatch.addComponent(props.node, true);
    },
  },
  React.createClass({
    onClick() {
      actionDispatch.selectComponent(this.props.node);
    },
    render() {
      return (
        <span
          ref={(ref) => { this.props.node._domElements.treeView = ref; }}
          onMouseDown={this.props.onMouseDown}
          onClick={this.onClick}
          className={classnames(
                this.props.className,
                'outline_' + this.props.node.id,
                { highlightBottom: false },
                'db',
              )}
        >{this.props.node.name}
        </span>
      );
    },
  }),
);

const TreeChildren = React.createClass({
  render() {
    const children = _.map(this.props.children, function (child, ind) {
      return <ComponentTree node={child} key={child.id} isFirst={ind === 0} />;
    });

    return (
      <div className="ml3">
        {children}
      </div>
    );
  },
});

export default ComponentTree;
