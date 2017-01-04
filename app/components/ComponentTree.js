import React from 'react';
import _ from 'lodash';
import { dragManager, createDraggableComponent } from '../dragManager.js';
import { actionDispatch } from '../stateManager.js';
import classnames from 'classnames';
import $ from 'jquery';

const Spacer = function (props) {
  let sx;
  if (props.isActive) {
    sx = {
      border: '1px solid orange',
      marginTop: 1,
      marginBottom: 1,
    };
  } else if (props.isNear) {
    sx = {
      border: '1px solid blue',
      marginTop: 1,
      marginBottom: 1,
    };
  }

  return (
    <div style={sx} />
  );
};



const ComponentTree = React.createClass({
  render() {
    let children;
    let afterSpacer, beforeSpacer;
    let { treeDropPoints, treeSelectedDropPoint, node } = this.props;
    if (node.parent) {
      function checkActive (dropPoint, ind) {
        console.log('dropPoint', dropPoint, 'ind', ind, 'node', node);
        if (!dropPoint) { return false };
        return dropPoint.parent.id === node.parent.id && dropPoint.insertionIndex === ind;
      }

      if (this.props.node.isFirstChild()) {
        beforeSpacer = <Spacer
                           isActive={checkActive(treeSelectedDropPoint, 0)}
                           isNear={_.some(treeDropPoints, (dp) => {checkActive(dp, 0)})}
                       />;
      }

      afterSpacer = (
        <Spacer
            isActive={checkActive(treeSelectedDropPoint, node.getInd() + 1)}
            isNear={_.some(treeDropPoints, (dp) => {
                checkActive(dp, node.getInd() + 1)
              })}
        />
      )
    }

    if (this.props.node.children && this.props.node.children.length) {
      children = <TreeChildren children={this.props.node.children} treeDropPoints={treeDropPoints} treeSelectedDropPoint={treeSelectedDropPoint} />;
    }

    return (
      <div
          className="mt1"
          ref={(ref) => { this.props.node._domElements.treeView = ref; }}
      >
        {beforeSpacer}
        <TreeItem {...this.props} />
        {children}
        {afterSpacer}
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
      actionDispatch.resetTreeHighlight();
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
    let { treeDropPoints, treeSelectedDropPoint } = this.props;
    const children = _.map(this.props.children, function (child, ind) {
      return (
        <ComponentTree
            treeSelectedDropPoint={treeSelectedDropPoint}
            treeDropPoints={treeDropPoints}
            node={child}
            key={child.id}
            isFirst={ind === 0}
        />
      );
    });

    return (
      <div className="ml3">
        {children}
      </div>
    );
  },
});

export default ComponentTree;
