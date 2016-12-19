import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import { CONTAINER, HEADER, PARAGRAPH, IMAGE } from '../base_components.js';
import { dragManager, createDraggableComponent } from '../dragManager.js';
import { actionDispatch } from '../stateManager.js';

import HorizontalSelect from './HorizontalSelect.js';

var dragData = {
  dragType: "addComponent",
  onDrag(props, pos) {
    actionDispatch.setComponentMoveHighlight(pos);
  },
  onEnd(props, pos) {
    actionDispatch.addComponent(props.mComponentData, true);
  }
};

var ContainerClassReact = createDraggableComponent(dragData, React.createClass({
  getInitialState() {
    return {
      isExpanded: false
    };
  },

  shouldExpand() {
    return this.state.isExpanded || (this.props.isMouseInRenderer && this.props.mComponentData.getRect().h < 10);
  },

  componentWillReceiveProps(nextProps) {
    if (this.shouldExpand() && nextProps.isMouseInRenderer && !this.state.isExpanded) {
      this.setState({isExpanded: true});
    }

    if(this.state.isExpanded && !nextProps.isMouseInRenderer) {
      this.setState({isExpanded: false});
    }
  },

  render: function() {
    let {mComponentData, componentProps, isMouseInRenderer, className} = this.props;
    let sx = {};

    var children = _.map(mComponentData.children, function (child) {
      return <MComponentDataRenderer key={child.id} mComponentData={child} componentProps={componentProps} isMouseInRenderer={isMouseInRenderer} />
    });

    return (
      <div
          ref={(ref) => {
              mComponentData._el = ref
            }}
          style={Object.assign(this.props.sx, sx)}
          onClick={this.props.onClick}
          className={classnames("node_" + mComponentData.id, "expandable-element", {expanded: this.shouldExpand()}, className)}>
        {children}
      </div>
    );
  }
}));

var HeaderClassReact = createDraggableComponent(dragData, React.createClass({
  render: function() {
    let {mComponentData, className} = this.props;
    return (
      <h1
          ref={(ref) => {mComponentData._el = ref}}
          style={this.props.sx} className={classnames("node_" + mComponentData.id, className)}
          onClick={this.props.onClick}>
        {this.props.htmlProperties.text}
      </h1>
    )
  }
}));

var ParagraphClassReact = createDraggableComponent(dragData, React.createClass({
  render: function() {
    let {mComponentData, className} = this.props;
    return (
      <p
          ref={(ref) => {mComponentData._el = ref}}
          style={this.props.sx} className={classnames("node_" + mComponentData.id, className)}
          onClick={this.props.onClick}>
        {this.props.htmlProperties.text}
      </p>
    );
  }
}));

var ImageClassReact = createDraggableComponent(dragData, React.createClass({
  render: function() {
    let {mComponentData, className} = this.props;
    return (
      <img
          ref={(ref) => {mComponentData._el = ref}}
          style={this.props.sx}
          className={classnames("node_" + mComponentData.id, className)} src={mComponent.attributes.src}
          onClick={this.props.onClick}/>
    );
  }
}));

/*
   I have a tree of components as data.
   What do I need to do with the components:
   - render them
   - change their properties
   - Rearrange them
   - Compute data from them (ex. drop points)

   Need to seperate the data and the rendering...
 */

function makeClick(component) {
  return function (e) {
    actionDispatch.selectComponent(component);
    e.stopPropagation();
  }
}

var MComponentDataRenderer = function(props) {
  /* TD: expand for custom components */
  var componentType = props.mComponentData.componentType;
  var {htmlProperties, sx} = props.mComponentData.getRenderableProperties();
  var className;
  var component;

  if (props.componentProps.activeComponent) {
    className = {isActive: props.componentProps.activeComponent.id === props.mComponentData.id};
  }

  if (componentType === CONTAINER) {
    component = <ContainerClassReact className={className}  onClick={makeClick(props.mComponentData)} {...props} htmlProperties={htmlProperties} sx={sx} />;
  } else if (componentType === HEADER) {
    component = <HeaderClassReact className={className}  onClick={makeClick(props.mComponentData)} {...props} htmlProperties={htmlProperties} sx={sx} />;
  } else if (componentType === PARAGRAPH) {
    component = <ParagraphClassReact className={className}  onClick={makeClick(props.mComponentData)} {...props} htmlProperties={htmlProperties} sx={sx} />;
  } else if (componentType === IMAGE) {
    component = <ImageClassReact className={className}  onClick={makeClick(props.mComponentData)} {...props} htmlProperties={htmlProperties} sx={sx} />;
  }

  return component;
}


var StaticRenderer = React.createClass({
  getInitialState() {
    return {
      isMouseInRenderer: false
    };
  },

  mouseMove: function(e) {
    /*     actionDispatch.setHoveredNodes(e.clientX, e.clientY);*/
  },

  mouseEnter() {
    this.setState({isMouseInRenderer: true});
  },

  mouseLeave() {
    this.setState({isMouseInRenderer: false});
  },

  render: function() {
    let {
      mComponentData,
      activeView,
      page,
      componentProps
    } = this.props;
    let renderer;

    if (page) {
      renderer = <MComponentDataRenderer mComponentData={page.componentTree} componentProps={componentProps} isMouseInRenderer={this.state.isMouseInRenderer} />;
    }

    return (
      <div className="h-100">
        <HorizontalSelect
            className="ma2"
            onClick={(name) => { actionDispatch.selectView(name) }}
            hasBorder={true}
            activePanel={activeView}
            options={[
              {text: "None", name: "NONE"},
              {text: "Border", name: "BORDER"},
              {text: "Detail", name: "DETAIL"}
            ]}/>
        <div onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}  onMouseMove={this.mouseove} className={classnames("ma2 h-100 ba c-grab", {
            "static-view-border": activeView === "BORDER",
            "static-view-detail": activeView === "DETAIL",
          })}>
          {renderer}
        </div>
      </div>
    );
  }
});

export default StaticRenderer;
