import _ from 'lodash';
import $ from 'jquery';

import { guid, Rect } from './utils';
import {
  breakpointTypes,
  NONE
} from './constants';

const CONTAINER = 'CONTAINER';
const HEADER = 'HEADER';
const TEXT = 'TEXT';
const IMAGE = 'IMAGE';
const ROOT = 'ROOT';

/*
   attrs[state][breakpoint] =

   what takes precedent??
   -

   default
   breakpoints
   states

   getting:
   { breakpoint: , state: }

   breakpoint: none,
   state: none, hover
*/

export const componentTypes = {
   CONTAINER,
   HEADER,
   TEXT,
   IMAGE,
   ROOT
}

export function creatNewImageSpec(asset) {
  return {
    name: asset.name,
    defaultAttributes: { src: asset.src }
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
    defaultAttributes: spec.defaultAttributes || {},
    id: spec.id || guid(),
    states: {},
    obreakpoints: {}
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
  id: ROOT,
  defaultAttributes: {
    height: '100%'
  }
});

export const containerAttributes = Object.assign({}, defaultAttributes, {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start'
});


export const container = createComponentData(CONTAINER, {
  name: 'Container',
  id: CONTAINER,
  defaultAttributes: containerAttributes,
});

export const text = createComponentData(TEXT, {
  name: 'Text',
  id: TEXT,
  defaultAttributes: Object.assign({}, defaultAttributes, {
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis libero at libero dictum tempor. Cras ut odio erat. Fusce semper odio ac dignissim sollicitudin. Vivamus in tortor lobortis, bibendum lacus feugiat, vestibulum magna. Vivamus pellentesque mollis turpis, at consequat nisl tincidunt at. Nullam finibus cursus varius. Nam id consequat nunc, vitae accumsan metus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Suspendisse fringilla sed lorem eleifend porta. Vivamus euismod, sapien at pretium convallis, elit libero auctor felis, id porttitor dui leo id ipsum. Etiam urna velit, ornare condimentum tincidunt quis, tincidunt a dolor. Morbi at ex hendrerit, vestibulum tellus eu, rhoncus est. In rutrum, diam dignissim condimentum tristique, ante odio rhoncus justo, quis maximus elit orci id orci.'
  })
});

export const header = createComponentData(HEADER, {
  name: 'Header',
  id: HEADER,
  defaultAttributes: Object.assign({}, defaultAttributes, {
    text: 'I am a header'
  })
});

export const image = createComponentData(IMAGE, {
  name: 'Image',
  id: IMAGE,
  defaultAttributes: Object.assign({}, defaultAttributes, {
    src: ''
  })
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

  setAttribute(componentId, attributeName, newValue, attributeOptions) {
    const component = this.components[componentId];
    let attributes = component.defaultAttributes;

    if (attributeOptions) {
      // TD: Clean!!
      const { state, breakpoint } = attributeOptions;
      let attributeType, attributeOption;
      if (state !== NONE) {
        attributeType = 'states';
        attributeOption = state;
      } else if (breakpoint !== NONE) {
        attributeType = 'breakpoints';
        attributeOption = breakpoint;
      }

      if (attributeType) {
        if (!component[attributeType][attributeOption]) {
          component[attributeType][attributeOption] = {};
        }
        attributes = component[attributeType][attributeOption];
      }
    }

    attributes[attributeName] = newValue;
  }

  // Read
  getAttributes(componentId, attributeOptions) {
    let component = this.components[componentId];
    let masterAttrs = {};

    let attributes = component.defaultAttributes;

    if (component.masterId) {
      masterAttrs = this.getAttributes(component.masterId, attributeOptions);
    }

    if (attributeOptions) {
      const { state, breakpoint } = attributeOptions;

      if (state !== NONE) {
        attributes = component.states[state];
      } else if (breakpoint !== NONE) {
        attributes = component.breakpoints[breakpoint];
      }
    }

    return Object.assign(
      {},
      masterAttrs,
      attributes
    );
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
    let el = $('.' + viewType + '_' + componentId);

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

  getRenderableProperties(componentId, attributeOptions) {
    let attrToCssLookup = {};
    let attrToHtmlPropertyLookup = {
      text: true,
      src: true
    };

    // default attributes
    let attributes = this.getAttributes(componentId);

    if (attributeOptions) {
      Object.assign(attributes, this.getAttributes(componentId, attributeOptions));
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

  getRenderTree(componentId, context, ...privateVars) {
    /*
       For future perf could store the changed node ids since last render
       and mark components to not render.
     */

    /*

       context: {
         componentStates: { id of component and state} - only if not none
         width
       }

       component stuff with:
       sx
       htmlProperties

       Later delete stuff
     */

    // TD: if I only take certain properties I can make this cheaper

    let index = privateVars[0];
    let componentClone = _.cloneDeep(this.components[componentId]);
    let breakpoint = NONE;
    let state = NONE;
    let defaultFont = 16; // TD: read from dom.

    if (context) {
      if (context.width > (30 * defaultFont) && context.width < (60 * defaultFont)) {
        breakpoint = breakpointTypes.MEDIUM;
      } if (context.width > (60 * defaultFont)) {
        breakpoint = breakpointTypes.LARGE;
      }

      if (context.states[componentId]) {
        state = context.states[componentId];
      }
    }


    let { sx, htmlProperties } = this.getRenderableProperties(componentId, {
      breakpoint,
      state
    });

    componentClone.sx = sx;
    componentClone.htmlProperties = htmlProperties;
    componentClone.index = index;
    componentClone.name = this.getName(componentId);

    componentClone.parent = _.cloneDeep(this.components[componentClone.parentId]);
    componentClone.master = _.cloneDeep(this.components[componentClone.masterId]);

    let children = [];
    componentClone.childIds.forEach((id, ind) => {
      children.push(this.getRenderTree(id, context, ind));
    });
    componentClone.children = children;

    return componentClone;
  }

  getParentData(componentId) {
    return this.components[this.components[componentId].parentId];
  }
}
