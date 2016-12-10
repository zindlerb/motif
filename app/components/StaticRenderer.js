import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import { CONTAINER, HEADER, PARAGRAPH, IMAGE } from '../base_components.js';
import dragManager from '../dragManager.js';
import { actionDispatch } from '../stateManager.js';

import HorizontalSelect from './HorizontalSelect.js';

/*
   Transforms the component tree data into a dom representation.

   Minor design tradeoff:
   Could put have the react component referenced by the classes.



   if (this._el && dragManager.drag && dragManager.drag.dragType === "addComponent") {
   var r = this.getRect();
   if((r.h < 10) && !this.isExpanded) {
   this.isExpanded = true;
   }
   } else {
   this.isExpanded = false;
   }

   return (
   <div
   ref={(r) => this._el = r}
   className={
   classnames({
   expand: this.isExpanded,
   isActive: props.activeComponent && (props.activeComponent.id === this.id)
   })}
   onClick={this.makeOnClick(this)}>
   {element}
   </div>
   )
 */

var ContainerClassReact = React.createClass({
  getInitialState() {
    return {
      isExpanded: false
    };
  },
  componentDidMount() {
    this.dragListenId = dragManager.subscribe("addComponent", {
      onStart: () => {
        var rect = this.props.mComponentData.getRect();
        if (rect.h < 10) {
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

  componentDidDismount() {
    dragManager.unsubscribe(this.dragListenId);
  },

  render: function() {
    let {mComponentData, componentProps} = this.props;
    var sx = {};
    var children = _.map(mComponentData.children, function (child) {
      return <MComponentDataRenderer key={child.id} mComponentData={child} componentProps={componentProps} />
    });

    if (this.state.isExpanded) {
      sx.height = 30;
      sx.padding = 5;
    }

    return (
      <div ref={(ref) => {
          mComponentData._el = ref
        }}  style={Object.assign(mComponentData.getCss(), sx)} className={"node_" + mComponentData.id}>
        {children}
      </div>
    );
  }
});

var HeaderClassReact = React.createClass({
  render: function() {
    let {mComponentData} = this.props;
    return (
      <h1 ref={(ref) => {mComponentData._el = ref}} style={mComponentData.getCss()} className={"node_" + mComponentData.id}>
        {mComponentData.attributes.text}
      </h1>
    )
  }
});

var ParagraphClassReact = React.createClass({
  render: function() {
    let {mComponentData} = this.props;
    return (
      <p ref={(ref) => {mComponentData._el = ref}} style={mComponentData.getCss()} className={"node_" + mComponentData.id}>
        {mComponentData.attributes.text}
      </p>
    );
  }
});

var ImageClassReact = React.createClass({
  render: function() {
    let {mComponentData} = this.props;
    return (
      <img ref={(ref) => {mComponentData._el = ref}} style={mComponentData.getCss()} className={"node_" + mComponentData.id} src={mComponent.attributes.src} />
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

var MComponentDataRenderer = function(props) {
  /* TD: expand for custom components */
  console.log("props", props);
  var componentType = props.mComponentData.componentType;

  if (componentType === CONTAINER) {
    return <ContainerClassReact {...props}/>;
  } else if (componentType === HEADER) {
    return <HeaderClassReact {...props} />;
  } else if (componentType === PARAGRAPH) {
    return <ParagraphClassReact {...props} />;
  } else if (componentType === IMAGE) {
    return <ImageClassReact {...props} />;
  }
}


var StaticRenderer = React.createClass({
  render: function() {
    let {
      mComponentData,
      activeView,
      page,
      componentProps
    } = this.props;
    let renderer;

    console.log("renderer props", this.props)

    if (page) {
      renderer = <MComponentDataRenderer mComponentData={page.componentTree} componentProps={componentProps} />;
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
        <div className={classnames("ma2 h-100 ba", {
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
