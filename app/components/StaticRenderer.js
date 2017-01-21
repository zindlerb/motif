import $ from 'jquery';
import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import { Root, Container, Header, Text, Image, DEFAULT, HOVER } from '../base_components';
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
    const selectedComponentViewDropSpot = props.context.selectedComponentViewDropSpot;
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

const RootClassReact = function (props) {
  const {
    mComponentData,
    sx,
    className,
    context,
    isMouseInRenderer
  } = props;

  const children = _.map(mComponentData.children, function (child) {
    return (
      <MComponentDataRenderer
          key={child.id}
          mComponentData={child}
          context={context}
          isMouseInRenderer={isMouseInRenderer}
      />);
  });

  return (
    <div
        className={classnames('root-component', className)}
        style={sx}>
      { children }
    </div>
  );
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
    const { mComponentData, context, isMouseInRenderer, className } = this.props;

    const children = _.map(mComponentData.children, function (child) {
      return (
        <MComponentDataRenderer
            key={child.id}
            mComponentData={child}
            context={context}
            isMouseInRenderer={isMouseInRenderer}
        />);
    });

    return (
      <div
          onMouseEnter={(e) => { this.props.onMouseEnter(e) }}
          onMouseLeave={(e) => { this.props.onMouseLeave(e) }}
          onClick={this.props.onClick}
          onMouseDown={this.props.onMouseDown}
          ref={makeComponentRefCallback(mComponentData)}
          style={this.props.sx}
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
    const {
      mComponentData,
      className,
      sx,
      htmlProperties,
    } = this.props;
    return (
      <h1
          onMouseEnter={(e) => { this.props.onMouseEnter(e) }}
          onMouseLeave={(e) => { this.props.onMouseLeave(e) }}
          onMouseDown={this.props.onMouseDown}
          ref={makeComponentRefCallback(mComponentData)}
          style={sx} className={classnames('node_' + mComponentData.id, className)}
          onClick={this.props.onClick}
      >
        {htmlProperties.text}
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
          onMouseEnter={(e) => { this.props.onMouseEnter(e) }}
          onMouseLeave={(e) => { this.props.onMouseLeave(e) }}
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
    const {
      mComponentData,
      className,
      sx,
      htmlProperties
    } = this.props;
    return (
      <img
          onMouseEnter={(e) => { this.props.onMouseEnter(e) }}
          onMouseLeave={(e) => { this.props.onMouseLeave(e) }}
          onMouseDown={this.props.onMouseDown}
          ref={makeComponentRefCallback(mComponentData)}
          style={sx}
          className={classnames('node_' + mComponentData.id, className)}
          src={htmlProperties.src}
          onClick={this.props.onClick}
      />
    );
  },
}));

function makeClick(component) {
  return function (e) {
    actionDispatch.selectComponent(component);
    actionDispatch.changePanel('ATTRIBUTES', 'right');
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
    actionDispatch.hoverComponent(this.props.mComponentData);
    this.setState({isHovered: true});
  },

  resetHovered() {
    actionDispatch.unHoverComponent();
    this.setState({isHovered: false});
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
    let className, component;
    let { context, mComponentData } = this.props;
    let { hoveredComponent, activeComponent } = context;

    let componentState = this.getComponentState();
    let renderableProperties = mComponentData.getRenderableProperties(DEFAULT);

    if (componentState !== DEFAULT) {
      _.merge(
        renderableProperties,
        mComponentData.getRenderableProperties(componentState)
      );
    }

    const { htmlProperties, sx } = renderableProperties;
    const isActiveComponent = activeComponent && activeComponent.id === mComponentData.id;

    className = {
      'active-component': isActiveComponent,
      'hovered-component': (
        !isActiveComponent &&
        hoveredComponent &&
        hoveredComponent.id === mComponentData.id
      )
    };

    if (mComponentData instanceof Root) {
      component = (
        <RootClassReact
            {...this.props}
            sx={sx}
        />
      );
    } else if (mComponentData instanceof Container) {
      component = (
        <ContainerClassReact
            className={className}
            onMouseEnter={this.setHovered}
            onMouseLeave={this.resetHovered}
            onClick={makeClick(mComponentData)}
            {...this.props}
            htmlProperties={htmlProperties}
            sx={sx}
        />
      );
    } else if (mComponentData instanceof Header) {
      component = (
        <HeaderClassReact
            className={className}
            onMouseEnter={this.setHovered}
            onMouseLeave={this.resetHovered}
            onClick={makeClick(mComponentData)}
            {...this.props}
            htmlProperties={htmlProperties}
            sx={sx}
        />
      );
    } else if (mComponentData instanceof Text) {
      component = (
        <ParagraphClassReact
            className={className}
            onMouseEnter={this.setHovered}
            onMouseLeave={this.resetHovered}
            onClick={makeClick(mComponentData)}
            {...this.props}
            htmlProperties={htmlProperties}
            sx={sx}
        />
      );
    } else if (mComponentData instanceof Image) {
      component = (
        <ImageClassReact
            className={className}
            onMouseEnter={this.setHovered}
            onMouseLeave={this.resetHovered}
            onClick={makeClick(mComponentData)}
            {...this.props}
            htmlProperties={htmlProperties}
            sx={sx}
        />
      );
    }

    return component;
  }
});

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
      context,
      width,
    } = this.props;
    let renderer;

    if (page) {
      renderer = (
        <MComponentDataRenderer
            mComponentData={page.componentTree}
            context={context}
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
