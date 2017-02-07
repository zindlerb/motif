import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import classnames from 'classnames';

import dragManager from '../dragManager';
import {
  attributeStateTypes,
} from '../base_components';
import {
  componentTypes,
} from '../constants';
import HorizontalSelect from '../components/HorizontalSelect';

const RootClassReact = function (props) {
  const {
    mComponentData,
    sx,
    className,
    context,
    actions,
    isMouseInRenderer
  } = props;

  const children = _.map(mComponentData.children, function (child) {
    return (
      <MComponentDataRenderer
          key={child.id}
          mComponentData={child}
          context={context}
          actions={actions}
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

const ContainerClassReact = React.createClass({
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
    const {
      mComponentData,
      context,
      isMouseInRenderer,
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
            isMouseInRenderer={isMouseInRenderer}
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
    // add a drag manager for listening and unlistening to events
    dragManager.start(e, {
      dragType: 'resize',
      initialX: e.clientX,
      initialWidth: props.width,
      onDrag(e) {
        props.actions.setRendererWidth(this.initialWidth - ((this.initialX - e.clientX) * 2));
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
      componentTree,
      context,
      width,
      actions
    } = this.props;
    let renderer;

    if (componentTree) {
      renderer = (
        <MComponentDataRenderer
            actions={this.props.actions}
            mComponentData={componentTree}
            context={context}
            isMouseInRenderer={this.state.isMouseInRenderer}
        />
      );
    }

    return (
      <div className="flex flex-auto flex-column">
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
        </div>
        <div
            onMouseEnter={this.mouseEnter}
            onMouseLeave={this.mouseLeave}
            onMouseMove={this.mouseove}
            style={{ width }}
            className={classnames('flex-auto m-auto relative ba', {
                'static-view-border': activeView === 'BORDER',
                'static-view-detail': activeView === 'DETAIL',
              })}
        >
          {renderer}

          <DragHandle direction="left" width={width} actions={actions} />
          <DragHandle direction="right" width={width} actions={actions} />
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
    componentTree = siteComponents.getRenderTree(rootComponent.id, {
      width: state.rendererWidth,
      states: {}
    });
  }

  return {
    width: state.rendererWidth,
    componentTree,
    activeView: state.activeView,
    context: {
      hoveredComponentId: state.hoveredComponentId,
      activeComponentId: state.activeComponentId,
      selectedComponentViewDropSpot: state.selectedComponentViewDropSpot
    }
  };
}, null, null, { pure: false })(StaticRenderer);
