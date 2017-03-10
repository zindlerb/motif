import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import classnames from 'classnames';

import {
  Rect,
  createImmutableJSSelector
} from '../utils';

import {
  createNewImageSpec,
  ComponentsContainer,
  image
} from '../base_components';

import {
  componentTypes
} from '../constants';

const ROOT = 'ROOT';
const INSERT_ASSET = 'INSERT_ASSET';
const INSERT_COMPONENT = 'INSERT_COMPONENT';

function RightTriangle(props) {
  const size = 10;
  return (
    <img
        className={props.className}
        style={{ width: size, height: size }}
        alt=""
        src="public/img/assets/right-triangle.svg" />
  );
}

const ComponentMenuItem = React.createClass({
  render() {
    return (
      <li
          ref={(el) => {
              if (this.props.getElement) {
                this.props.getElement(el);
              }
            }}
          key={this.props.key}
          className={classnames({ disabled: this.props.isDisabled }, this.props.className)}
          onMouseEnter={(e) => {
              if (!this.props.isDisabled && this.props.onMouseEnter) {
                this.props.onMouseEnter(e);
              }
            }}
          onMouseUp={(e) => {
              if (!this.props.isDisabled) {
                this.props.onMouseUp();
              } else {
                e.stopPropagation();
              }
            }}>
        <span>
          {this.props.children}
        </span>
      </li>
    );
  }
});

const ComponentMenu = React.createClass({
  getInitialState() {
    return {
      searchString: '',
      openListItem: undefined,
    };
  },

  //TD: cleanup event
  componentDidMount() {
    window.addEventListener('mouseup', () => {
      if (this.props.menu.isOpen) {
        this.props.actions.closeMenu();
      }
    });
  },

  componentWillReceiveProps(nextProps) {
    if (!nextProps.menu.isOpen && this.state.menuState !== ROOT) {
      this.setState({
        searchString: '',
        openListItem: undefined,
      });
    }
  },

  closeNestedMenus() {
    if (this.state.openListItem) {
      this.setState({ openListItem: undefined });
    }
  },

  render() {
    let {
      componentIdMapByName,
      menu,
      assets,
      isRoot,
      canHaveChildren,
      actions
    } = this.props;

    let {
      componentId,
      parentId,
      insertionIndex,
      isOpen,
      mouseX,
      mouseY
    } = menu;

    let {
      openListItem,
      secondaryPosX,
      secondaryPosY
    } = this.state;

    let secondaryList;
    let primaryMenuWidth = 150;

    let sx = {
      width: primaryMenuWidth,
      position: 'absolute',
      left: mouseX,
      top: mouseY
    };

    let secondaryMenuWidth = 100;
    let secondaryListStyle = {
      position: 'absolute',
      left: secondaryPosX + primaryMenuWidth,
      top: secondaryPosY,
      width: secondaryMenuWidth
    };
    let componentList;

    if (isOpen) {
      if (openListItem) {
        if (openListItem === INSERT_COMPONENT) {
          componentList = _.keys(componentIdMapByName).map((componentName) => {
            return (
              <ComponentMenuItem
                  key={componentName}
                  onMouseUp={() => {
                      this.props.actions.addVariant(
                        componentIdMapByName[componentName],
                        isRoot ? componentId : parentId,
                        insertionIndex
                      );
                    }}>
                {componentName}
              </ComponentMenuItem>
            );
          });
        }

        if (openListItem === INSERT_ASSET) {
          componentList = assets.map((asset, ind) => {
            return (
              <ComponentMenuItem
                  key={ind}
                  onMouseUp={() => {
                      this.props.actions.addVariant(
                        image.get('id'),
                        isRoot ? componentId : parentId,
                        insertionIndex,
                        createNewImageSpec(asset)
                      );
                    }}>
                {asset.name}
              </ComponentMenuItem>
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

      // TD: refactor to li with real disable
      return (
        <div>
          <ul style={sx} className="component-menu">
            <ComponentMenuItem
                key="DELETE"
                isDisabled={!componentId || isRoot}
                onMouseEnter={this.closeNestedMenus}
                onMouseUp={() => { actions.deleteComponent(componentId) }}
            >
              Delete
              <i className="fa fa-trash ph1 fr" aria-hidden="true" />
            </ComponentMenuItem>
            <ComponentMenuItem
                key={'MAKE_COMPONENT'}
                isDisabled={!componentId || isRoot}
                onMouseEnter={this.closeNestedMenus}
                onMouseUp={() => { actions.createComponentBlock(componentId) }}
            >
              Make Component
              <i className="fa fa-id-card-o ph1 fr" aria-hidden="true" />
            </ComponentMenuItem>
            <ComponentMenuItem
                className={INSERT_COMPONENT}
                isDisabled={!canHaveChildren && isRoot}
                key={INSERT_COMPONENT}
                getElement={(el) => { this._insertComponentEl = el; }}
                onMouseEnter={() => {
                    let rect = new Rect(this._insertComponentEl);
                    this.setState({
                      openListItem: INSERT_COMPONENT,
                      secondaryPosX: rect.x,
                      secondaryPosY: rect.y,
                    });
                  }}
            >
              Insert Component
              <RightTriangle className="ph1 fr" />
            </ComponentMenuItem>
            <ComponentMenuItem
                key={INSERT_ASSET}
                isDisabled={(!assets.length) || (!canHaveChildren && isRoot)}
                getElement={(el) => { this._insertAssetEl = el; }}
                onMouseEnter={() => {
                    if (assets.length) {
                      let rect = new Rect(this._insertAssetEl);
                      this.setState({
                        openListItem: INSERT_ASSET,
                        secondaryPosX: rect.x,
                        secondaryPosY: rect.y,
                      });
                    }
                  }}
            >
              Insert Asset
              <RightTriangle className="ph1 fr" />
            </ComponentMenuItem>
          </ul>
          {secondaryList}
        </div>
      );
    } else {
      return <div />;
    }
  }
});

const menuSelector = createImmutableJSSelector(
  [
    state => state.get('componentsMap'),
    state => state.get('menu'),
    state => state.get('ourComponentBoxes'),
    state => state.get('yourComponentBoxes'),
    state => state.get('assets'),
  ],
  (componentsMap, menu, ourComponentBoxes,
   yourComponentBoxes, assets) => {
     let componentIdMapByName = {};
     let menuJs = menu.toJS()

     if (menuJs.isOpen) {
       // TD: Add selector here
       const makeComponentIdMap = (componentId) => {
         let name = ComponentsContainer.getName(componentsMap, componentId);
         componentIdMapByName[name] = componentId;
       }

       ourComponentBoxes.forEach(makeComponentIdMap);
       yourComponentBoxes.forEach(makeComponentIdMap);

       return {
         menu: menuJs,
         componentIdMapByName,
         canHaveChildren: componentsMap.getIn([menuJs.componentId, 'componentType']) === componentTypes.CONTAINER,
         isRoot: !menuJs.parentId,
         // TD: EXPENSIVE! Remove.
         assets: _.toArray(assets.toJS())
       }
     } else {
       return { menu: menuJs };
     }
   }
);

export default connect(menuSelector)(ComponentMenu);
