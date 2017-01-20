import _ from 'lodash';

import {
  Container,
  Header,
  Text,
  Image,
  Root,
  CONTAINER,
  HEADER,
  TEXT,
  IMAGE,
  ROOT
} from './base_components';

function serializerFactory() {
  // serializableKeys ['siteName', 'componentBoxes', 'pages', 'currentPage'];
  function replaceComponentsOnComponentDatum(componentData, cb) {
    _.forEach(componentData, function (val, key) {
      if (_.includes(['master', 'parent'], key)) {
        componentData[key] = cb(val);
      } else if (_.includes(['_variants', 'children'], key)) {
        componentData[key] = _.map(componentData[key], function (compData) {
          return cb(compData);
        });
      }
    });
  }

  function serialize(state) {
    let componentMap = {};
    let newPages = [];
    let newComponentBoxes = {
      ours: [],
      yours: []
    };

    function putSelfAndAllChildrenInComponentMap(component) {
      componentMap[component.id] = component.getSerializableData();

      component.walkChildren(function (childComponent) {
        componentMap[childComponent.id] = childComponent.getSerializableData();
      });
    }

    // Put all components and their children in component map.
    state.pages.forEach(function (page) {
      let newPage = Object.assign({}, page);
      putSelfAndAllChildrenInComponentMap(page.componentTree);

      newPage.componentTree = page.componentTree.id;
      newPages.push(newPage);
    });

    ['ours', 'yours'].forEach(function (key) {
      newComponentBoxes[key] = _.map(state.componentBoxes[key], function (component) {
        putSelfAndAllChildrenInComponentMap(component);
        return component.id;
      });
    });

    // Within component map transform all component references into ids
    _.forEach(componentMap, function (component) {
      replaceComponentsOnComponentDatum(component, function (childComponent) {
        if (childComponent) {
          return childComponent.id;
        } else {
          return childComponent;
        }
      });
    });

    return JSON.stringify({
      siteName: state.siteName,
      pages: newPages,
      componentMap,
      componentBoxes: newComponentBoxes,
      currentPage: state.currentPage.id,
      assets: state.assets
    });
  }

  function deserialize(jsonState) {
    let {
      siteName,
      pages,
      componentMap,
      componentBoxes,
      currentPage,
      assets
    } = JSON.parse(jsonState);

    function componentDataToClass(componentData) {
      if (componentData.componentType === CONTAINER) {
        return new Container(componentData);
      } else if (componentData.componentType === TEXT) {
        return new Text(componentData);
      } else if (componentData.componentType === IMAGE) {
        return new Image(componentData);
      } else if (componentData.componentType === HEADER) {
        return new Header(componentData);
      } else if (componentData.componentType === ROOT) {
        return new Root(componentData);
      } else {
        throw new Error('Malformed Component Data ' + JSON.stringify(componentData));
      }
    }

    let componentClassMap = {};

    _.forEach(componentMap, function (componentData, key) {
      componentClassMap[key] = componentDataToClass(componentData);
    });

    _.forEach(componentClassMap, function (component) {
      replaceComponentsOnComponentDatum(
        component,
        function (id) {
          return componentClassMap[id];
        }
      );
    });

    let newPages = _.map(pages, function (page) {
      page.componentTree = componentClassMap[page.componentTree];
      return page;
    });

    _.forEach(componentBoxes, function (val, key) {
      componentBoxes[key] = _.map(val, function (componentId) {
        return componentClassMap[componentId];
      });
    });

    let currentPageObj = _.find(newPages, function (page) {
      return page.id === currentPage;
    });

    return {
      siteName,
      pages: newPages,
      componentBoxes,
      currentPage: currentPageObj,
      assets
    };
  }

  return { serialize, deserialize };
}

const serializer = serializerFactory();

export default serializer;
