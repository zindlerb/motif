import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
// import fuzzy from 'fuzzy';
import { Rect } from '../utils';

import { createNewImageSpec, image } from '../base_components';
import { actionDispatch } from '../stateManager';

const ROOT = 'ROOT';
const INSERT_ASSET = 'INSERT_ASSET';
const INSERT_COMPONENT = 'INSERT_COMPONENT';

function LeftTriangle(props) {
  const size = 10;
  return (
    <img
        className={props.className}
        style={{ width: size, height: size }}
        alt=""
        src="public/img/assets/left-triangle.svg" />
  );
}

const ComponentMenu = React.createClass({
  getInitialState() {
    return {
      searchString: '',
      openListItem: undefined,
    };
  },

  componentWillReceiveProps(nextProps) {
    if (!nextProps.menu.isOpen && this.state.menuState !== ROOT) {
      this.setState({
        searchString: '',
        openListItem: undefined,
      });
    }
  },

  render() {
    let { componentMapByName, menu, assets } = this.props;
    let { component, isOpen, componentX, componentY } = menu;
    let { openListItem, secondaryPosX, secondaryPosY } = this.state;
    let menuComponent = component;
    let secondaryList;

    let sx = {
      position: 'absolute',
      left: componentX,
      top: componentY
    };

    let secondaryMenuWidth = 100;
    let secondaryListStyle = {
      position: 'absolute',
      left: secondaryPosX - secondaryMenuWidth,
      top: secondaryPosY,
      width: secondaryMenuWidth
    };
    let componentList;

    if (isOpen) {
      if (openListItem) {
        if (openListItem === INSERT_COMPONENT) {
          componentList = _.keys(componentMapByName).map(function (componentName) {
            return (
              <li
                  key={componentName}
                  onMouseUp={() => {
                      actionDispatch.addVariant(
                        componentMapByName[componentName],
                        menu.component.parentId,
                        menu.component.ind
                      );
                    }}>
                {componentName}
              </li>
            );
          });
        }

        if (openListItem === INSERT_ASSET) {
          componentList = assets.map(function (asset, ind) {
            return (
              <li
                  key={ind}
                  onMouseUp={() => {
                      actionDispatch.addVariant(
                        image.id,
                        menu.component.parent,
                        menu.component.ind,
                        createNewImageSpec(asset)
                      );
                    }}>
                {asset.name}
              </li>
            );
          });
        }

        secondaryList = (
          <ul className="component-menu" style={secondaryListStyle}>
            {componentList}
          </ul>
        );
      }

      if (openListItem === INSERT_ASSET) {
        secondaryList = (
          <ul className="component-menu" style={secondaryListStyle}>
            {componentList}
          </ul>
        );
      }

      return (
        <div>
          <ul style={sx} className="component-menu">
            <li
                key={'DELETE'}
                onMouseEnter={() => { this.setState({ openListItem: undefined }) }}
                onMouseUp={(e) => {
                    actionDispatch.deleteComponent(menuComponent);
                    actionDispatch.closeMenu();
                    e.stopPropagation();
                  }}>
              <i className="fa fa-trash ph1" aria-hidden="true" />
              Delete
            </li>
            <li
                key={'MAKE_COMPONENT'}
                onMouseEnter={() => { this.setState({ openListItem: undefined }) }}
                onMouseUp={(e) => {
                    actionDispatch.createComponentBlock(menuComponent);
                    actionDispatch.closeMenu();
                    e.stopPropagation();
                  }}>
              <i className="fa fa-id-card-o ph1" aria-hidden="true" />
              Make Component
            </li>
            <li
                className={INSERT_COMPONENT}
                key={INSERT_COMPONENT}
                ref={(ref) => { this._insertComponentEl = ref }}
                onMouseEnter={(e) => {
                    let rect = new Rect().fromElement(this._insertComponentEl);
                    this.setState({
                      openListItem: INSERT_COMPONENT,
                      secondaryPosX: rect.x,
                      secondaryPosY: rect.y,
                    });
                    e.stopPropagation();
                  }}>
              <LeftTriangle className="ph1" />
              Insert Component
            </li>
            <li
                key={INSERT_ASSET}
                ref={(ref) => { this._insertAssetEl = ref }}
                onMouseEnter={(e) => {
                    let rect = new Rect().fromElement(this._insertAssetEl);
                    this.setState({
                      openListItem: INSERT_ASSET,
                      secondaryPosX: rect.x,
                      secondaryPosY: rect.y,
                    });
                    e.stopPropagation();
                  }}>
              <LeftTriangle className="ph1" />
              Insert Asset
            </li>
          </ul>
          {secondaryList}
        </div>
      );
    } else {
      return <div />;
    }
  }
});

export default connect(
  function (state) {
    let componentMapByName;
    if (state.menu.isOpen) {
      componentMapByName = _.reduce(
        state.componentBoxes,
        function (componentMapByName, componentList) {
          _.forEach(componentList, function (component) {
            componentMapByName[component.name] = component;
          });

          return componentMapByName;
        },
        {}
      );
    }

    return {
      menu: state.menu,
      componentMapByName,
      assets: state.assets
    }
  },
  null,
  null,
  { pure: false }
)(ComponentMenu);
