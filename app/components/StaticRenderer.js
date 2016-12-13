import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import { CONTAINER, HEADER, PARAGRAPH, IMAGE } from '../base_components.js';
import dragManager from '../dragManager.js';
import { actionDispatch } from '../stateManager.js';

import HorizontalSelect from './HorizontalSelect.js';

var ContainerClassReact = React.createClass({
  getInitialState() {
    return {
      isExpanded: false
    };
  },

  shouldExpand() {
    return this.props.mComponentData.getRect().h < 10;
  },

  componentDidMount() {
    this.dragListenId = dragManager.subscribe("addComponent", {
      onStart: () => {
        if (this.shouldExpand()) {
          this.setState({
            isExpanded: true
          });
        }
      },
      onEnd: () => {
        if (this.state.isExpanded) {
          this.setState({
            isExpanded: false
          });
        }
      }
    })
  },

  componentWillReceiveProps(nextProps) {
    if (this.shouldExpand() && nextProps.isMouseInRenderer && !this.state.isExpanded) {
      this.setState({isExpanded: true});
    }

    if(this.state.isExpanded && !nextProps.isMouseInRenderer) {
      this.setState({isExpanded: false});
    }
  },

  componentDidDismount() {
    dragManager.unsubscribe(this.dragListenId);
  },

  render: function() {
    let {mComponentData, componentProps, isMouseInRenderer} = this.props;
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
          onClick={this.onClick}
          className={classnames("node_" + mComponentData.id, "expandable-element", {expanded: this.state.isExpanded})}>
        {children}
      </div>
    );
  }
});

var HeaderClassReact = React.createClass({
  render: function() {
    let {mComponentData} = this.props;
    return (
      <h1
          ref={(ref) => {mComponentData._el = ref}}
          style={this.props.sx} className={"node_" + mComponentData.id}
          onClick={this.onClick}>
        {this.props.htmlProperties.text}
      </h1>
    )
  }
});

var ParagraphClassReact = React.createClass({
  render: function() {
    let {mComponentData} = this.props;
    return (
      <p
          ref={(ref) => {mComponentData._el = ref}}
          style={this.props.sx} className={"node_" + mComponentData.id}
          onClick={this.onClick}>
        {this.props.htmlProperties.text}
      </p>
    );
  }
});

var ImageClassReact = React.createClass({
  render: function() {
    let {mComponentData} = this.props;
    return (
      <img
          ref={(ref) => {mComponentData._el = ref}}
          style={this.props.sx}
          className={"node_" + mComponentData.id} src={mComponent.attributes.src}
          onClick={this.onClick}/>
    );
  }
});

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
  return function () {
    actionDispatch.selectComponent(component);
  }
}

var MComponentDataRenderer = function(props) {
  /* TD: expand for custom components */
  var componentType = props.mComponentData.componentType;
  var {htmlProperties, sx} = props.mComponentData.getRenderableProperties();

  if (componentType === CONTAINER) {
    return <ContainerClassReact {...props} htmlProperties={htmlProperties} sx={sx} />;
  } else if (componentType === HEADER) {
    return <HeaderClassReact {...props} htmlProperties={htmlProperties} sx={sx} />;
  } else if (componentType === PARAGRAPH) {
    return <ParagraphClassReact {...props} htmlProperties={htmlProperties} sx={sx} />;
  } else if (componentType === IMAGE) {
    return <ImageClassReact {...props} htmlProperties={htmlProperties} sx={sx} />;
  }
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
      console.log("state", this.state.isMouseInRenderer);
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
        <div onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}  onMouseMove={this.mouseove} className={classnames("ma2 h-100 ba", {
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
