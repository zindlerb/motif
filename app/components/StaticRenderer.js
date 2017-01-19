import $ from 'jquery';
import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import { Container, Header, Text, Image, DEFAULT, HOVER } from '../base_components';
import { createDraggableComponent, dragManager } from '../dragManager';
import { actionDispatch } from '../stateManager';

import HorizontalSelect from './HorizontalSelect';

// TD: remove duplication on hover and add come kind of static wrapper with element cloning

const dragData = {
  dragType: 'addComponent',
  onDrag(props, pos) {
    actionDispatch.updateComponentViewDropSpots(pos);
  },
  onEnd(props) {
    const selectedComponentViewDropSpot = props.componentProps.selectedComponentViewDropSpot;
    if (selectedComponentViewDropSpot) {
      actionDispatch.moveComponent(
        props.mComponentData,
        selectedComponentViewDropSpot.parent,
        selectedComponentViewDropSpot.insertionIndex
      );
    }

    actionDispatch.resetComponentViewDropSpots();
  },
};

function makeComponentRefCallback(mComponentData) {
  return function (ref) {
    mComponentData['###domElements'].pageView = ref;
  };
}

const ContainerClassReact = createDraggableComponent(dragData, React.createClass({
  getInitialState() {
    return {
      isExpanded: false,
      isHovered: false
    };
  },

  componentWillReceiveProps(nextProps) {
    if (this.shouldExpand() && nextProps.isMouseInRenderer && !this.state.isExpanded) {
      this.setState({ isExpanded: true });
    }

    if (this.state.isExpanded && !nextProps.isMouseInRenderer) {
      this.setState({ isExpanded: false });
    }
  },

  shouldExpand() {
    const rect = this.props.mComponentData.getRect('pageView');
    if (!rect) {
      /* No element assigned yet */
      return false;
    }

    return rect.h < 10;
  },

  render() {
    const { mComponentData, componentProps, isMouseInRenderer, className } = this.props;
    const sx = {};

    const children = _.map(mComponentData.children, function (child) {
      return (
        <MComponentDataRenderer
            key={child.id}
            mComponentData={child}
            componentProps={componentProps}
            isMouseInRenderer={isMouseInRenderer}
        />);
    });

    return (
      <div
          onMouseEnter={() => { this.setState({isHovered: true}) }}
          onMouseLeave={() => { this.setState({isHovered: false}) }}
          onClick={this.props.onClick}
          onMouseDown={this.props.onMouseDown}
          ref={makeComponentRefCallback(mComponentData)}
          style={Object.assign(this.props.sx, sx)}
          className={classnames('node_' + mComponentData.id, 'expandable-element', { expanded: this.state.isExpanded }, className)}
      >
        {children}
      </div>
    );
  },
}));

const HeaderClassReact = createDraggableComponent(dragData, React.createClass({
  getInitialState() {
    return {
      isHovered: false
    };
  },

  render() {
    const { mComponentData, className } = this.props;
    return (
      <h1
          onMouseEnter={() => { this.setState({isHovered: true}) }}
          onMouseLeave={() => { this.setState({isHovered: false}) }}
          onMouseDown={this.props.onMouseDown}
          ref={makeComponentRefCallback(mComponentData)}
          style={this.props.sx} className={classnames('node_' + mComponentData.id, className)}
          onClick={this.props.onClick}
      >
        {this.props.htmlProperties.text}
      </h1>
    );
  },
}));

const ParagraphClassReact = createDraggableComponent(dragData, React.createClass({
  getInitialState() {
    return {
      isHovered: false
    };
  },

  render() {
    const { mComponentData, className } = this.props;
    return (
      <p
          onMouseEnter={() => { this.setState({isHovered: true}) }}
          onMouseLeave={() => { this.setState({isHovered: false}) }}
          onMouseDown={this.props.onMouseDown}
          ref={makeComponentRefCallback(mComponentData)}
          style={this.props.sx} className={classnames('node_' + mComponentData.id, className)}
          onClick={this.props.onClick}
      >
        {this.props.htmlProperties.text}
      </p>
    );
  },
}));

const ImageClassReact = createDraggableComponent(dragData, React.createClass({
  getInitialState() {
    return {
      isHovered: false
    };
  },

  render() {
    const { mComponentData, className } = this.props;
    return (
      <img
          onMouseEnter={() => { this.setState({isHovered: true}) }}
          onMouseLeave={() => { this.setState({isHovered: false}) }}
          onMouseDown={this.props.onMouseDown}
          ref={makeComponentRefCallback(mComponentData)}
          style={this.props.sx}
          className={classnames('node_' + mComponentData.id, className)}
          src={mComponentData.attributes.src}
          onClick={this.props.onClick}
      />
    );
  },
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
  };
}

const MComponentDataRenderer = React.createClass({
  getInitialState() {
    return {
      isHovered: false
    }
  },

  setHovered() {
    this.setState({isHovered: false});
  },

  resetHovered() {
    this.setState({isHovered: true});
  },

  getComponentState() {
    if (this.state.isHovered) {
      return HOVER;
    } else {
      return DEFAULT;
    }
  },

  render: function () {
    /* TD: expand for custom components */
    let mComponentData = this.props.mComponentData;
    const { htmlProperties, sx } = this.props.mComponentData.getRenderableProperties(this.getComponentState());
    let className, component;

    if (this.props.componentProps.activeComponent) {
      className = { 'active-component': this.props.componentProps.activeComponent.id === this.props.mComponentData.id };
    }

    if (mComponentData instanceof Container) {
      component = (<ContainerClassReact
                       className={className}
                       onClick={makeClick(this.props.mComponentData)}
                       {...this.props}
                       htmlProperties={htmlProperties}
                       sx={sx}
                   />);
    } else if (mComponentData instanceof Header) {
      component = (<HeaderClassReact
                       className={className}
                       onClick={makeClick(this.props.mComponentData)}
                       {...this.props}
                       htmlProperties={htmlProperties}
                       sx={sx}
                   />);
    } else if (mComponentData instanceof Text) {
      component = (<ParagraphClassReact
                       className={className}
                       onClick={makeClick(this.props.mComponentData)}
                       {...this.props}
                       htmlProperties={htmlProperties}
                       sx={sx}
                   />);
    } else if (mComponentData instanceof Image) {
      component = (<ImageClassReact
                       className={className}
                       onClick={makeClick(this.props.mComponentData)}
                       {...this.props}
                       htmlProperties={htmlProperties}
                       sx={sx}
                   />);
    }

    return component;
  }
});

  function (props) {

};

function DragHandle(props) {
  var height = 60;
  var width = 20;
  var left;

  if (props.direction === 'left') {
    left = -width;
  } else if (props.direction === 'right') {
    left = '100%';
  }

  var style = {
    height,
    width,
    left
  }

  function dragStart(e) {
    dragManager.start(e, {
      dragType: 'resize',
      initialX: e.clientX,
      initialWidth: props.width,
      onDrag: function (e) {
        actionDispatch.setRendererWidth(this.initialWidth - ((this.initialX - e.clientX) * 2) );
      }
    });
  }

  return (
    <svg className='drag-handle' style={style} onMouseDown={dragStart}>
      <rect x='0' y='0' height={height} width={width} fill='black'/>
    </svg>
  );
}


const StaticRenderer = React.createClass({
  getInitialState() {
    return {
      isMouseInRenderer: false,
    };
  },

  mouseMove() {
    /*     actionDispatch.setHoveredNodes(e.clientX, e.clientY);*/
  },

  mouseEnter() {
    this.setState({ isMouseInRenderer: true });
  },

  mouseLeave() {
    this.setState({ isMouseInRenderer: false });
  },

  render() {
    let {
      activeView,
      activeBreakpoint,
      page,
      componentProps,
      width
    } = this.props;
    let renderer;

    if (page) {
      renderer = (
        <MComponentDataRenderer
            mComponentData={page.componentTree}
            componentProps={componentProps}
            isMouseInRenderer={this.state.isMouseInRenderer}
        />
      );
    }

    return (
      <div className="h-100">
        <div className="mb2 flex justify-center">
          <div>
            <span className="db f6">View</span>
            <HorizontalSelect
                className=""
                onClick={(name) => { actionDispatch.selectView(name); }}
                hasBorder
                activePanel={activeView}
                options={[
                  { text: 'None', name: 'NONE' },
                  { text: 'Border', name: 'BORDER' },
                  { text: 'Detail', name: 'DETAIL' },
                ]}
            />
          </div>
          <div className="ml2">
            <span className="db f6">Breakpoint</span>
            <HorizontalSelect
                className=""
                onClick={(name) => {
                    actionDispatch.selectBreakpoint(name);
                  }}
                hasBorder
                activePanel={activeBreakpoint}
                options={[
                  { name: 'NONE', text: 'None' },
                  { name: 'TABLET', faClass: 'fa-tablet' },
                  { name: 'LAPTOP', faClass: 'fa-laptop' },
                  { name: 'DESKTOP', faClass: 'fa-desktop' },
                ]}
            />
          </div>
        </div>
        <div className="h-100 m-auto relative" style={{width}}>
          <div
              onMouseEnter={this.mouseEnter}
              onMouseLeave={this.mouseLeave}
              onMouseMove={this.mouseove}
              className={classnames('mv2 h-100 ba c-grab', {
                  'static-view-border': activeView === 'BORDER',
                  'static-view-detail': activeView === 'DETAIL',
                })}
          >
            {renderer}
          </div>
          <DragHandle direction="left" width={width} />
          <DragHandle direction="right" width={width}/>
        </div>
      </div>
    );
  },
});

export default StaticRenderer;
