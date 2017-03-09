import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import $ from 'jquery';

import dragManager from '../dragManager';
import {
  attributeStateTypes,
} from '../base_components';
import {
  componentTypes,
  SIDEBAR_WIDTH
} from '../constants';

const RootClassReact = function (props) {
  const {
    mComponentData,
    sx,
    className,
    context,
    actions,
  } = props;

  const children = _.map(mComponentData.children, function (child) {
    return (
      <MComponentDataRenderer
          key={child.id}
          mComponentData={child}
          context={context}
          actions={actions}
      />);
  });

  return (
    <div
        className={classnames('root-component', className)}
        style={sx}>
      { children }
    </div>
  );
};

const ContainerClassReact = React.createClass({
  getInitialState() {
    return {
      isExpanded: false,
      isHovered: false
    };
  },

  componentWillReceiveProps(nextProps) {
    if (this.shouldExpand() && nextProps.context.isMouseInRenderer && !this.state.isExpanded) {
      this.setState({ isExpanded: true });
    }

    if (this.state.isExpanded && !nextProps.context.isMouseInRenderer) {
      this.setState({ isExpanded: false });
    }
  },

  shouldExpand() {
    /*
    const rect = this.props.mComponentData.getRect('pageView');
    if (!rect) {
      return false;
    }

    return rect.h < 10;
     */
    return false;
  },

  render() {
    const {
      mComponentData,
      context,
      className,
      actions
    } = this.props;

    const children = _.map(mComponentData.children, function (child) {
      return (
        <MComponentDataRenderer
            key={child.id}
            actions={actions}
            mComponentData={child}
            context={context}
        />
      );
    });

    return (
      <div
          onMouseEnter={(e) => { this.props.onMouseEnter(e); }}
          onMouseLeave={(e) => { this.props.onMouseLeave(e); }}
          onClick={this.props.onClick}
          onMouseDown={this.props.onMouseDown}
          style={this.props.sx}
          className={classnames('node_' + mComponentData.id, 'expandable-element', { expanded: this.state.isExpanded }, className)}
      >
        {children}
      </div>
    );
  },
});

const HeaderClassReact = React.createClass({
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
          style={sx} className={classnames('node_' + mComponentData.id, className)}
          onClick={this.props.onClick}
      >
        {htmlProperties.text}
      </h1>
    );
  },
});

const ParagraphClassReact = React.createClass({
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
          style={this.props.sx} className={classnames('node_' + mComponentData.id, className)}
          onClick={this.props.onClick}
      >
        {this.props.htmlProperties.text}
      </p>
    );
  },
});

const ImageClassReact = React.createClass({
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
          style={sx}
          className={classnames('node_' + mComponentData.id, className)}
          src={htmlProperties.src}
          onClick={this.props.onClick}
      />
    );
  },
});

const MComponentDataRenderer = React.createClass({
  getInitialState() {
    return {
      isHovered: false
    }
  },

  getComponentState() {
    if (this.state.isHovered) {
      return attributeStateTypes.HOVER;
    } else {
      return attributeStateTypes.DEFAULT;
    }
  },

  setHovered() {
    this.props.actions.hoverComponent(this.props.mComponentData);
    this.setState({ isHovered: true });
  },

  resetHovered() {
    this.props.actions.unHoverComponent();
    this.setState({ isHovered: false });
  },

  render() {
    /* TD: expand for custom components */
    let className, component;
    let { context, mComponentData, actions } = this.props;
    let { hoveredComponentId, activeComponentId } = context;
    const { htmlProperties, sx, componentType } = mComponentData;

    const isActiveComponent = activeComponentId === mComponentData.id;

    className = {
      'active-component': isActiveComponent,
      'hovered-component': (
        !isActiveComponent &&
        hoveredComponentId === mComponentData.id
      )
    };

    const onClick = (e) => {
      actions.selectComponent(mComponentData.id);
      actions.changePanel('ATTRIBUTES', 'right');
    }

    if (componentType === componentTypes.ROOT) {
      component = (
        <RootClassReact
            {...this.props}
            sx={sx}
        />
      );
    } else if (componentType === componentTypes.CONTAINER) {
      component = (
        <ContainerClassReact
            className={className}
            actions={this.props.actions}
            onMouseEnter={this.setHovered}
            onMouseLeave={this.resetHovered}
            onClick={onClick}
            {...this.props}
            htmlProperties={htmlProperties}
            sx={sx}
        />
      );
    } else if (componentType === componentTypes.HEADER) {
      component = (
        <HeaderClassReact
            className={className}
            onMouseEnter={this.setHovered}
            onMouseLeave={this.resetHovered}
            onClick={onClick}
            {...this.props}
            htmlProperties={htmlProperties}
            sx={sx}
        />
      );
    } else if (componentType === componentTypes.TEXT) {
      component = (
        <ParagraphClassReact
            className={className}
            onMouseEnter={this.setHovered}
            onMouseLeave={this.resetHovered}
            onClick={onClick}
            {...this.props}
            htmlProperties={htmlProperties}
            sx={sx}
        />
      );
    } else if (componentType === componentTypes.IMAGE) {
      component = (
        <ImageClassReact
            className={className}
            onMouseEnter={this.setHovered}
            onMouseLeave={this.resetHovered}
            onClick={onClick}
            {...this.props}
            htmlProperties={htmlProperties}
            sx={sx}
        />
      );
    }

    return component;
  }
});

const DragHandle = React.createClass({
  getInitialState() {
    return {};
  },
  dragStart(e) {
    let diff;
    const {
      direction,
      rendererWidth,
    } = this.props;
    // add a drag manager for listening and unlistening to events
    const that = this;
    dragManager.start(e, {
      dragType: 'resize',
      initialX: e.clientX,
      initialWidth: rendererWidth,
      onDrag(e) {
        if (direction === 'left') {
          diff = (e.clientX - this.initialX);
        } else {
          diff = (this.initialX - e.clientX);
        }

        this.newWidth = this.initialWidth - (diff * 2);

        if (this.newWidth > 30 &&
            this.newWidth < ($(window).width() - (SIDEBAR_WIDTH * 2) - 80)) {
          that.props.setRendererWidth(this.newWidth);
        }
      },
      onEnd: () => {
        this.setState({ isDragging: false });
      }
    });

    this.setState({ isDragging: true });
  },
  render() {
    let height = 60;
    let width = 20;
    let left;
    let src;
    const {
      direction,
    } = this.props;

    if (direction === 'left') {
      left = -width;
      src = 'public/img/assets/left-handle.svg';
    } else if (direction === 'right') {
      left = '100%';
      src = 'public/img/assets/right-handle.svg';
    }

    let style = {
      height,
      width,
      left
    }

    return (
      <img
          draggable={false}
          className={classnames(
              'drag-handle',
              this.state.isDragging ? 'c-grabbing' : 'c-grab')}
          style={style}
          onMouseDown={this.dragStart}
          src={src}
      />
    );
  }
});


const StaticRenderer = React.createClass({
  getInitialState() {
    return {
      isMouseInRenderer: false,
    };
  },

  mouseEnter() {
    this.setState({ isMouseInRenderer: true });
  },

  mouseLeave() {
    this.setState({ isMouseInRenderer: false });
  },

  render() {
    let {
      renderTree,
      activeComponentId,
      hoveredComponentId,
      width,
      setRendererWidth,
      actions
    } = this.props;
    let renderer;

    if (renderTree) {
      renderer = (
        <MComponentDataRenderer
            mComponentData={renderTree}
            actions={actions}
            context={{
              activeComponentId,
              hoveredComponentId,
              isMouseInRenderer: this.state.isMouseInRenderer
            }}
        />
      );
    }

    return (
      <div
          onMouseEnter={this.mouseEnter}
          onMouseLeave={this.mouseLeave}
          onMouseMove={this.mouseove}
          style={{ width }}
          className={classnames('renderer-container flex-auto m-auto relative static-view-border')}
      >
        {renderer}
        <DragHandle
            direction="left"
            rendererWidth={width}
            setRendererWidth={setRendererWidth}
            actions={actions}
        />
        <DragHandle
            direction="right"
            rendererWidth={width}
            setRendererWidth={setRendererWidth}
            actions={actions}
        />
      </div>
    );
  },
});

export default StaticRenderer;
