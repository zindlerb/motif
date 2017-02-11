import React from 'react';
import { createSelector } from 'reselect'
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
import { focusRefCallback } from '../utils';
import HorizontalSelect from '../components/HorizontalSelect';
import FormLabel from '../components/forms/FormLabel';
import PopupSelect from '../components/PopupSelect';
import UpArrow from '../components/UpArrow';

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
  let src;

  if (props.direction === 'left') {
    left = -width;
    src = 'public/img/assets/left-handle.svg';
  } else if (props.direction === 'right') {
    left = '100%';
    src = 'public/img/assets/right-handle.svg';
  }

  let style = {
    height,
    width,
    left
  }

  function dragStart(e) {
    let diff;
    // add a drag manager for listening and unlistening to events
    dragManager.start(e, {
      dragType: 'resize',
      initialX: e.clientX,
      initialWidth: props.width,
      onDrag(e) {
        if (props.direction === 'left') {
          diff = (e.clientX - this.initialX);
        } else {
          diff = (this.initialX - e.clientX);
        }

        props.actions.setRendererWidth(this.initialWidth - (diff * 2));
      }
    });
  }

  return (
    <img
        onDragStart={e => e.preventDefault()}
        className="drag-handle"
        style={style}
        onMouseDown={dragStart}
        src={src}
    />
  );
}

const PagesPopup = React.createClass({
  getInitialState() {
    return {
      isEditing: false,
      tempText: ''
    }
  },
  render() {
    const { pages, currentPageId, currentPageName, actions } = this.props;
    const { isEditing, tempText } = this.state;
    let isActive;
    let pageComponents = pages.map((page) => {
      isActive = page.id === currentPageId;

      if (isActive && isEditing) {
        return (
          <li>
            <input
                value={tempText}
                ref={focusRefCallback}
                onChange={(e) => { this.setState({ tempText: e.target.value }) }}
                onBlur={(e) => {
                    this.setState({ isEditing: false, tempText: '' });
                    actions.setPageValue(page.id, 'name', e.target.value);
                  }}
            />
          </li>
        );
      } else {
        return (
          <li
              className={classnames({ highlighted: isActive })}
              onClick={() => { actions.changePage(page.id) }}
          >
            {page.name}
          </li>
        );
      }
    });

    if (pageComponents.length === 0) {
      pageComponents.push(
        <li className="suggestion">Please Add a page</li>
      );
    }

    return (
      <div>
        <div
            style={{
              top: this.props.y,
              left: this.props.x
            }}
            className="popup tl fixed w5">
          <div className="ph3">
            <i
                className="fa fa-plus"
                aria-hidden="true"
                onClick={() => { actions.addPage() }}
            />
            <i
                className="fa fa-trash"
                aria-hidden="true"
                onClick={() => { actions.deletePage(currentPageId) }}
            />
            <i
                className="fa fa-pencil-square-o"
                aria-hidden="true"
                onClick={() => {
                    this.setState({
                      isEditing: true,
                      tempText: currentPageName
                    });
                  }}
            />
          </div>
          <ul>
            {pageComponents}
          </ul>
        </div>
        <UpArrow y={this.props.y} x={this.props.x} />
      </div>
    );
  }
})


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
      currentPageId,
      actions,
      currentPageName,
      pages
    } = this.props;
    let renderer;
    currentPageName = currentPageName || 'No Page';

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
          <FormLabel className="mh2" name="Page">
            <PopupSelect
                value={currentPageName}
                className="f6 pv1">
              <PagesPopup
                  pages={pages}
                  currentPageId={currentPageId}
                  currentPageName={currentPageName}
                  actions={actions}
              />
            </PopupSelect>
          </FormLabel>
          <FormLabel name="View">
            <HorizontalSelect
                onClick={(name) => { this.props.actions.selectView(name); }}
                hasBorder
                activePanel={activeView}
                options={[
                  { text: 'Minimal', value: 'MINIMAL' },
                  { text: 'Dense', value: 'DENSE' }
                ]}
            />
          </FormLabel>
        </div>
        <div
            onMouseEnter={this.mouseEnter}
            onMouseLeave={this.mouseLeave}
            onMouseMove={this.mouseove}
            style={{ width }}
            className={classnames('renderer-container flex-auto m-auto relative', {
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

const pageListSelector = createSelector(
  [state => state.get('pages')],
  (imPages) => {
    let pages = [];
    imPages.forEach((page) => {
      pages.push({
        id: page.get('id'),
        name: page.get('name')
      })
    });

    return pages;
  }
)

export default connect(function (state) {
  let componentTree, currentPageId = state.get('currentPageId');

  if (currentPageId) {
    let componentTreeId = state.getIn(['pages', currentPageId, 'componentTreeId']);

    componentTree = state.get('componentsContainer').getRenderTree(componentTreeId, {
      width: state.get('rendererWidth'),
      // TD: track and add states
      states: {}
    });
  }

  return {
    width: state.get('rendererWidth'),
    componentTree,
    activeView: state.get('activeView'),
    pages: pageListSelector(state),
    currentPageId,
    currentPageName: state.getIn(['pages', currentPageId, 'name']),
    context: {
      hoveredComponentId: state.get('hoveredComponentId'),
      activeComponentId: state.get('activeComponentId'),
      selectedComponentViewDropSpot: state.get('selectedComponentViewDropSpot')
    }
  };
}, null, null, { pure: false })(StaticRenderer);
