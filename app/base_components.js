import _ from 'lodash';
import { guid, Rect } from './utils';

const CONTAINER = 'CONTAINER';
const HEADER = 'HEADER';
const TEXT = 'TEXT';
const IMAGE = 'IMAGE';
const ROOT = 'ROOT';

export const componentTypes = {
   CONTAINER,
   HEADER,
   TEXT,
   IMAGE,
   ROOT
}

const DEFAULT = 'DEFAULT';
const HOVER = 'HOVER';

export const attributeStateTypes = {
  DEFAULT,
  HOVER
}

export function creatNewImageSpec(asset) {
  return {
    name: asset.name,
    attributes: {
      [DEFAULT]: { src: asset.src }
    }
  }
}

export function createComponentData(componentType, spec) {
  return {
    componentType,
    name: spec.name,
    childIds: spec.childIds || [],
    variantIds: [],
    masterId: spec.masterId,
    parentId: spec.parentId,
    attributes: spec.attributes || {},
    id: spec.id || guid(),
    domElements: {}
  }
}

const defaultAttributes = {
  position: 'static',
  margin: '0px',
  padding: '0px',
  height: 'auto',
  width: 'auto',
  backgroundColor: 'transparent'
};

export const root = createComponentData(ROOT, {
  attributes: {
    [DEFAULT]: {
      height: '100%'
    }
  }
});

export const containerAttributes = {
  [DEFAULT]: Object.assign({}, defaultAttributes, {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start'
  })
};

export const container = createComponentData(CONTAINER, {
  name: 'Container',
  id: CONTAINER,
  attributes: containerAttributes,
});

export const text = createComponentData(TEXT, {
  name: 'Text',
  id: TEXT,
  attributes: {
    [DEFAULT]: Object.assign({}, defaultAttributes, {
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis libero at libero dictum tempor. Cras ut odio erat. Fusce semper odio ac dignissim sollicitudin. Vivamus in tortor lobortis, bibendum lacus feugiat, vestibulum magna. Vivamus pellentesque mollis turpis, at consequat nisl tincidunt at. Nullam finibus cursus varius. Nam id consequat nunc, vitae accumsan metus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Suspendisse fringilla sed lorem eleifend porta. Vivamus euismod, sapien at pretium convallis, elit libero auctor felis, id porttitor dui leo id ipsum. Etiam urna velit, ornare condimentum tincidunt quis, tincidunt a dolor. Morbi at ex hendrerit, vestibulum tellus eu, rhoncus est. In rutrum, diam dignissim condimentum tristique, ante odio rhoncus justo, quis maximus elit orci id orci.'
    })
  }
});

export const header = createComponentData(HEADER, {
  name: 'Header',
  id: HEADER,
  attributes: {
    [DEFAULT]: Object.assign({}, defaultAttributes, {
      text: 'I am a header'
    })
  }
});

export const image = createComponentData(IMAGE, {
  name: 'Image',
  id: IMAGE,
  attributes: {
    [DEFAULT]: Object.assign({}, defaultAttributes, {
      src: ''
    })
  },
});

export class SiteComponents {
  constructor(components) {
    this.components = components || {
      [root.id]: root,
      [container.id]: container,
      [header.id]: header,
      [text.id]: text,
      [image.id]: image,
    };
  }

  // Mutations
  // Component Map
  createVariant(masterId, spec) {
    let master = this.components[masterId];
    let variant = createComponentData(
      master.componentType,
      Object.assign({ masterId }, spec)
    );

    master.variantIds.push(variant.id);

    this.components[variant.id] = variant;

    _.forEach(variant.childIds, (childId) => {
      this.components[childId].parentId = variant.id;
    });

    _.forEach(master.childIds, (childId) => {
      this.addChild(variant.id, this.createVariant(childId).id);
    });

    return variant;
  }

  deleteComponent(componentId) {
    let deletedComponent = this.components[componentId];
    delete this.components[componentId];
    let master = this.components[deletedComponent.masterId];

    if (deletedComponent.parentId) {
      _.remove(this.components[deletedComponent.parentId].childIds, (childId) => {
         return childId === deletedComponent.id;
      });
    }

    if (deletedComponent.masterId && master) {
      _.remove(master.variantIds, (variantId) => {
        return variantId === deletedComponent.id;
      });
    }

    _.forEach(deletedComponent.variantIds, this.deleteComponent.bind(this));

    return deletedComponent;
  }

  // Component (All these methods assume the component specified by an id has been created)
  addChild(parentId, childId, ind) {
    // Makes the assumption that the child exists in the component map
    let parent = this.components[parentId];

    parent.variantIds.forEach((variantId) => {
      this.addChild(variantId, childId, ind);
    });

    this.components[childId].parentId = parentId;
    if (ind === undefined) {
      parent.childIds.push(childId);
    } else {
      parent.childIds.splice(ind, 0, childId);
    }
  }

  moveComponent(movedComponentId, newParentId, insertionIndex) {
    // Delete from parent and remove from all variants of parent
    let movedComponent = this.components[movedComponentId];
    let parent = this.components[movedComponent.parentId];

    _.remove(parent.childIds, (childId) => {
      return childId === movedComponentId;
    });

    // Does the order of these statements matter?
    movedComponent.variantIds.forEach(this.deleteComponent);
    this.addChild(newParentId, movedComponentId, insertionIndex);
  }

  setAttribute(componentId, state, attributeName, newValue) {
    let attributes = this.components[componentId].attributes;
    if (!attributes[state]) {
      attributes.state = {};
    }

    attributes[state][attributeName] = newValue;
  }

  // Read
  getStateAttributes(componentId, state) {
    state = state || DEFAULT;

    let component = this.components[componentId];
    let masterAttrs = {};

    if (component.masterId) {
      masterAttrs = this.getStateAttributes(component.masterId, state);
    }

    return Object.assign({}, masterAttrs, component.attributes[state]);
  }

  getName(componentId) {
    let component = this.components[componentId];
    let master = this.components[component.masterId];

    if (!component.name) {
      return master.name;
    }

    return component.name;
  }

  getRect(componentId, viewType) {
    // Node Types: treeView, componentView
    let el = this.components[componentId].domElements[viewType];

    if (!el) {
      return undefined;
    }

    return new Rect().fromElement(el);
  }

  walkChildren(componentId, func, ...rest) {
    let ind, isChild;
    let component = this.components[componentId];

    // Used for recursion
    if (rest.length) {
      ind = rest[0];
      isChild = rest[1];
    }

    if (isChild) {
      func.call(this, component, ind);
    }

    component.childIds.forEach((childId, ind) => {
      this.walkChildren(childId, func, ind, true);
    });
  }

  getRenderableProperties(componentId, state) {
    let attrToCssLookup = {};
    let attrToHtmlPropertyLookup = {
      text: true,
      src: true
    };

    // TD
    let attributes = this.getStateAttributes(componentId, DEFAULT);

    if (state !== DEFAULT) {
      Object.assign(attributes, this.getStateAttributes(componentId, state));
    }

    return _.reduce(
      attributes,
      function (renderableAttributes, attrVal, attrKey) {
        if (attrToHtmlPropertyLookup[attrKey]) {
          renderableAttributes.htmlProperties[attrKey] = attrVal;
        } else if (attrToCssLookup[attrKey]) {
          Object.assign(renderableAttributes.sx, attrToCssLookup[attrKey](attrVal));
        } else {
          renderableAttributes.sx[attrKey] = attrVal;
        }

        return renderableAttributes;
      }, {
        htmlProperties: {},
        sx: {}
      }
    );
  }

  getRenderTree(componentId, componentStates, ...rest) {
    /*
       For future perf could store the changed node ids since last render
       and mark components to not render.
     */

    /*
       component stuff with:
       sx
       htmlProperties

       Later delete stuff
     */

    // TD: if I only take certain properties I can make this cheaper

    let index = rest[0];
    let componentClone = _.cloneDeep(this.components[componentId]);
    let state = DEFAULT;
    componentStates = componentStates || {};

    if (componentStates[componentId]) {
      state = componentStates[componentId];
    }

    let { sx, htmlProperties } = this.getRenderableProperties(componentId, state);

    componentClone.sx = sx;
    componentClone.htmlProperties = htmlProperties;
    componentClone.index = index;
    componentClone.name = this.getName(componentId);

    componentClone.parent = _.cloneDeep(this.components[componentClone.parentId]);
    componentClone.master = _.cloneDeep(this.components[componentClone.masterId]);

    let children = [];
    componentClone.childIds.forEach((id, ind) => {
      children.push(this.getRenderTree(id, componentStates, ind));
    });
    componentClone.children = children;

    return componentClone;
  }

  getParentData(componentId) {
    return this.components[this.components[componentId].parentId];
  }

  getDropPoints(componentId) {
    if (this.components[componentId].componentType !== CONTAINER) {
      return [];
    }

    let rect = this.getRect(componentId, 'pageView');
    let flexDirection = this.getStateAttributes(componentId).flexDirection;
    let initialPoints;
    let padding = 2;

    if (flexDirection === 'column') {
      initialPoints = [
        { x: rect.x, y: rect.y + padding },
        { x: rect.x + rect.w, y: rect.y + padding }
      ];
    } else if (flexDirection === 'row') {
      initialPoints = [
        { x: rect.x + padding, y: rect.y },
        { x: rect.x + padding, y: rect.y + rect.h }
      ];
    }

    let dropPoints = [
      {
        insertionIndex: 0,
        parent: componentId,
        points: initialPoints
      }
    ];

    this.childIds.forEach((childId, ind) => {
      let rect = this.getRect(childId, 'pageView');
      let points;

      if (flexDirection === 'column') {
        points = [{ x: rect.x, y: rect.y + rect.h }, { x: rect.x + rect.w, y: rect.y + rect.h }];
      } else if (flexDirection === 'row') {
        points = [{ x: rect.x + rect.w, y: rect.y }, { x: rect.x + rect.w, y: rect.y + rect.h }];
      }

      dropPoints.push({
        insertionIndex: ind + 1,
        parentId: componentId,
        points
      });
    });

    return dropPoints;
  }
}
