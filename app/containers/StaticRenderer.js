import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import classnames from 'classnames';
import {
  attributeStateTypes,
  componentTypes,
} from '../base_components';
import { createDraggableComponent, dragManager } from '../dragManager';

import HorizontalSelect from '../components/HorizontalSelect';

// TD: remove duplication on hover and add come kind of static wrapper with element cloning

const dragData = {
  dragType: 'addComponent',
  onDrag(props, pos) {
    props.actions.updateComponentViewDropSpots(pos);
  },
  onEnd(props) {
    const selectedComponentViewDropSpot = props.context.selectedComponentViewDropSpot;
    if (selectedComponentViewDropSpot) {
      props.actions.moveComponent(
        props.mComponentData,
        selectedComponentViewDropSpot.parent,
        selectedComponentViewDropSpot.insertionIndex
      );
    }

    props.actions.resetComponentViewDropSpots();
  },
};

function makeComponentRefCallback(mComponentData) {
  return function (ref) {
    mComponentData.domElements.pageView = ref;
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
};

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
          onMouseEnter={(e) => { this.props.onMouseEnter(e); }}
          onMouseLeave={(e) => { this.props.onMouseLeave(e); }}
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
    this.props.actions.selectComponent(component.id);
    this.props.actions.changePanel('ATTRIBUTES', 'right');
    e.stopPropagation();
  };
}

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
    let { context, mComponentData } = this.props;
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
            onMouseEnter={this.setHovered}
            onMouseLeave={this.resetHovered}
            onClick={makeClick(mComponentData)}
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
            onClick={makeClick(mComponentData)}
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
            onClick={makeClick(mComponentData)}
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
  let height = 60;
  let width = 20;
  let left;

  if (props.direction === 'left') {
    left = -width;
  } else if (props.direction === 'right') {
    left = '100%';
  }

  let style = {
    height,
    width,
    left
  }

  function dragStart(e) {
    dragManager.start(e, {
      dragType: 'resize',
      initialX: e.clientX,
      initialWidth: props.width,
      onDrag(e) {
        this.props.actions.setRendererWidth(this.initialWidth - ((this.initialX - e.clientX) * 2));
      }
    });
  }

  return (
    <svg className="drag-handle" style={style} onMouseDown={dragStart}>
      <rect x="0" y="0" height={height} width={width} fill="black" />
    </svg>
  );
}


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
      activeView,
      activeBreakpoint,
      componentTree,
      context,
      width,
    } = this.props;
    let renderer;

    if (componentTree) {
      renderer = (
        <MComponentDataRenderer
            mComponentData={componentTree}
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
                onClick={(name) => { this.props.actions.selectView(name); }}
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
                    this.props.actions.selectBreakpoint(name);
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
        <div className="h-100 m-auto relative" style={{ width }}>
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
          <DragHandle direction="right" width={width} />
        </div>
      </div>
    );
  },
});

export default connect(function (state) {
  const { siteComponents, currentPageId } = state;
  let componentTree, currentPage;

  if (currentPageId) {
    currentPage = _.find(state.pages, page => page.id === currentPageId);
    const rootComponent = siteComponents.components[currentPage.componentTreeId];
    componentTree = siteComponents.getRenderTree(rootComponent.id);
  }

  return {
    width: state.rendererWidth,
    componentTree,
    activeBreakpoint: state.activeBreakpoint,
    activeView: state.activeView,
    context: {
      hoveredComponentId: state.hoveredComponentId,
      activeComponentId: state.activeComponentId,
      selectedComponentViewDropSpot: state.selectedComponentViewDropSpot
    }
  };
}, null, null, { pure: false })(StaticRenderer);
