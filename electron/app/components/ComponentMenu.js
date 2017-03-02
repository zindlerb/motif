import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import {
  Rect,
  globalEventManager,
  createImmutableJSSelector
} from '../utils';

import {
  createNewImageSpec,
  ComponentsContainer,
  image
} from '../base_components';

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

const ComponentMenu = React.createClass({
  getInitialState() {
    return {
      searchString: '',
      openListItem: undefined,
    };
  },

  componentDidMount() {
    globalEventManager.addListener('mouseup', () => {
      if (this.props.menu.isOpen) {
        this.props.actions.closeMenu();
      }
    }, 10000);
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
    //console.log('COMPONENT_MENU RENDER');
    let {
      componentIdMapByName,
      menu,
      assets,
      parentId,
      componentIndex
    } = this.props;

    let {
      componentId,
      isOpen,
      componentX,
      componentY
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
      left: componentX,
      top: componentY
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
              <li
                  key={componentName}
                  onMouseUp={() => {
                      this.props.actions.addVariant(
                        componentIdMapByName[componentName],
                        parentId,
                        componentIndex
                      );
                    }}>
                {componentName}
              </li>
            );
          });
        }

        if (openListItem === INSERT_ASSET) {
          componentList = assets.map((asset, ind) => {
            return (
              <li
                  key={ind}
                  onMouseUp={() => {
                      this.props.actions.addVariant(
                        image.get('id'),
                        parentId,
                        componentIndex,
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
                onMouseEnter={this.closeNestedMenus}
                onMouseUp={(e) => {
                    this.props.actions.deleteComponent(componentId);
                    this.props.actions.closeMenu();
                    e.stopPropagation();
                  }}>
              Delete
              <i className="fa fa-trash ph1 fr" aria-hidden="true" />
            </li>
            <li
                key={'MAKE_COMPONENT'}
                onMouseEnter={this.closeNestedMenus}
                onMouseUp={(e) => {
                    this.props.actions.createComponentBlock(componentId);
                    this.props.actions.closeMenu();
                    e.stopPropagation();
                  }}>
              Make Component
              <i className="fa fa-id-card-o ph1 fr" aria-hidden="true" />
            </li>
            <li
                className={INSERT_COMPONENT}
                key={INSERT_COMPONENT}
                ref={(ref) => { this._insertComponentEl = ref }}
                onMouseEnter={(e) => {
                    let rect = new Rect(this._insertComponentEl);
                    this.setState({
                      openListItem: INSERT_COMPONENT,
                      secondaryPosX: rect.x,
                      secondaryPosY: rect.y,
                    });
                    e.stopPropagation();
                  }}>
              Insert Component
              <RightTriangle className="ph1 fr" />
            </li>
            <li
                key={INSERT_ASSET}
                ref={(ref) => { this._insertAssetEl = ref }}
                onMouseEnter={(e) => {
                    let rect = new Rect(this._insertAssetEl);
                    this.setState({
                      openListItem: INSERT_ASSET,
                      secondaryPosX: rect.x,
                      secondaryPosY: rect.y,
                    });
                    e.stopPropagation();
                  }}>
              Insert Asset
              <RightTriangle className="ph1 fr" />
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

// TD: what is a good pattern to use component map data but not re-render based on its changes??
const menuSelector = createImmutableJSSelector(
  [
    state => state.get('componentsMap'),
    state => state.get('menu'),
    state => state.get('ourComponentBoxes'),
    state => state.get('yourComponentBoxes'),
    state => state.get('assets')
  ],
  (componentsMap, menu, ourComponentBoxes, yourComponentBoxes, assets) => {
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
        parentId: componentsMap.getIn([
          menuJs.componentId, 'parentId'
        ]),
        componentIndex: ComponentsContainer.getIndex(componentsMap, menuJs.componentId),
        // TD: EXPENSIVE! Remove.
        assets: _.toArray(assets.toJS())
      }
    } else {
      return { menu: menuJs };
    }
  }
)

export default connect(menuSelector)(ComponentMenu);
