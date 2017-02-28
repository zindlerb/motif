import _ from 'lodash';
import Immutable from 'immutable';

import { guid, camelToDash } from './utils';
import {
  breakpointTypes,
  stateTypes,
  NONE,
  componentTypes
} from './constants';

const {
  CONTAINER,
  HEADER,
  TEXT,
  IMAGE,
  ROOT
} = componentTypes;

const {
  fromJS
} = Immutable;

export function createNewImageSpec(asset) {
  return {
    name: asset.name,
    defaultAttributes: { src: asset.src }
  }
}

export function createComponentData(componentType, spec) {
  return fromJS({
    componentType,
    name: spec.name,
    childIds: [],
    variantIds: [],
    masterId: spec.masterId,
    parentId: spec.parentId,
    defaultAttributes: spec.defaultAttributes || {},
    id: spec.id || guid(),
    states: spec.states || {},
    breakpoints: spec.breakpoints || {}
  });
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
    text: 'Text. Text. Text. I am some text.'
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

export const defaultComponentsMap = Immutable.Map({
  [root.get('id')]: root,
  [container.get('id')]: container,
  [header.get('id')]: header,
  [text.get('id')]: text,
  [image.get('id')]: image,
});

export class ComponentsContainer {
  constructor(components) {
    this.components = components;
  }

  //  Write
  createVariant(masterId, spec) {
    const variantId = guid();
    this.components = ComponentsContainer.createVariant(this.components, variantId, masterId, spec);
    return variantId;
  }

  static createVariant(componentsMap, variantId, masterId, spec) {
    return componentsMap.withMutations((components) => {
      let master = components.get(masterId)
                             .update('variantIds', function (variantIds) {
                               return variantIds.push(variantId);
                             });

      let variant = createComponentData(
        master.get('componentType'),
        Object.assign({ masterId, id: variantId }, spec)
      )

      components.set(masterId, master)
                .set(variantId, variant);

      master.get('childIds').forEach((childId) => {
        let childVariantId = guid();
        ComponentsContainer.createVariant(components, childVariantId, childId);
        ComponentsContainer.addChild(
          components,
          variantId,
          childVariantId
        );
      });
    });
  }

  deleteComponent(deletedComponentId) {
    this.components = ComponentsContainer.deleteComponent(this.components, deletedComponentId);
  }

  static deleteComponent(componentsMap, deletedComponentId) {
    return componentsMap.withMutations((components) => {
      let deletedComponent = components.get(deletedComponentId);
      let deletedComponentParent = components.get(deletedComponent.get('parentId'));
      let deletedComponentMaster = components.get(deletedComponent.get('masterId'));
      components.delete(deletedComponentId);

      if (deletedComponentParent) {
        components.set(
          deletedComponentParent.get('id'),
          deletedComponentParent.update('childIds', (childIds) => {
            return childIds.filterNot((childId) => {
              return childId === deletedComponentId;
            });
          })
        )
      }

      if (deletedComponentMaster) {
        components.set(
          deletedComponentMaster.get('id'),
          deletedComponentMaster.update('variantIds', (variantIds) => {
            return variantIds.filterNot((variantId) => {
              return variantId === deletedComponentId;
            });
          })
        )
      }

      // TD: if master is deleted should all the children really be deleted?
      // Should probably connect component to next nearest master
      deletedComponent.get('variantIds').forEach((variantId) => {
        ComponentsContainer.deleteComponent(components, variantId);
      });
    });
  }

  addChild(parentId, childId, ind) {
    this.components = ComponentsContainer.addChild(this.components, parentId, childId, ind);
  }

  static addChild(componentsMap, parentId, childId, ind) {
    return componentsMap.withMutations((components) => {
      components.get(parentId).get('variantIds').forEach((variantId) => {
        let childVariantId = guid();
        ComponentsContainer.createVariant(components, childVariantId, childId);
        ComponentsContainer.addChild(
          components,
          variantId,
          childVariantId,
          ind
        );
      });

      components.set(
        childId,
        components.get(childId).set('parentId', parentId)
      );

      components.set(
        parentId,
        components.get(parentId).update('childIds', (childIds) => {
          if (ind === undefined) {
            return childIds.push(childId);
          } else {
            return childIds.splice(ind, 0, childId);
          }
        })
      );
    });
  }

  moveComponent(movedComponentId, newParentId, insertionIndex) {
    this.components = ComponentsContainer.moveComponent(
      this.components,
      movedComponentId,
      newParentId,
      insertionIndex
    );
  }

  static moveComponent(componentsMap, movedComponentId, newParentId, insertionIndex) {
    // Delete from parent and remove from all variants of parent
    return componentsMap.withMutations((components) => {
      let movedComponent = components.get(movedComponentId);
      let movedComponentParent = components.get(movedComponent.get('parentId'));

      components.set(
        movedComponentParent.get('id'),
        movedComponentParent.update('childIds', (childIds) => {
          return childIds.filterNot((childId) => {
            return childId === movedComponentId;
          });
        })
      );

      movedComponent.get('variantIds').forEach((variantId) => {
        ComponentsContainer.deleteComponent(components, variantId);
      });

      ComponentsContainer.addChild(components, newParentId, movedComponentId, insertionIndex);
    });
  }

  setAttribute(componentId, attributeName, newValue, attributeOptions) {
    this.components = ComponentsContainer.setAttribute(
      this.components,
      componentId,
      attributeName,
      newValue,
      attributeOptions
    )
  }

  static setAttribute(componentsMap, componentId, attributeName, newValue, attributeOptions) {
    return componentsMap.withMutations((components) => {
      let component = components.get(componentId);
      const { state, breakpoint } = attributeOptions || {};
      let attributeType, attributeOption;

      if (state !== NONE) {
        attributeType = 'states';
        attributeOption = state;
      } else if (breakpoint !== NONE) {
        attributeType = 'breakpoints';
        attributeOption = breakpoint;
      }

      if (attributeType) {
        if (!component.getIn([attributeType, attributeOption])) {
          component = component.setIn(
            [attributeType, attributeOption],
            Immutable.Map()
          );
        }

        component = component.setIn(
          [attributeType, attributeOption, attributeName],
          newValue
        );
      } else {
        component = component.setIn(['defaultAttributes', attributeName], newValue);
      }

      return components.set(componentId, component);
    });
  }

  //  Read
  getAttributes(componentId, attributeOptions) {
    return ComponentsContainer.getAttributes(this.components, componentId, attributeOptions);
  }

  static getAttributes(componentsMap, componentId, attributeOptions) {
    let component = componentsMap.get(componentId);
    const { state, breakpoint } = attributeOptions || { state: NONE, breakpoint: NONE };

    const masterId = component.get('masterId');
    let masterAttrs = {};
    let attributes;

    if (masterId) {
      masterAttrs = ComponentsContainer.getAttributes(
        componentsMap,
        masterId,
        attributeOptions
      );
    }

    if (state !== NONE &&
        component.getIn(['states', state])) {
      attributes = component.getIn(['states', state]).toJS();
    } else if (breakpoint !== NONE &&
               component.getIn(['breakpoints', breakpoint])) {
      attributes = component.getIn(['breakpoints', breakpoint]).toJS();
    } else {
      attributes = component.get('defaultAttributes').toJS();
    }

    return Object.assign(
      masterAttrs,
      attributes
    );
  }

  getName(componentId) {
    return ComponentsContainer.getName(this.components, componentId);
  }

  static getName(componentsMap, componentId) {
    let component = componentsMap.get(componentId);
    if (!component.get('name')) {
      return componentsMap.get(component.get('masterId')).get('name');
    } else {
      return component.get('name');
    }
  }

  walkChildren(componentId, func) {
    ComponentsContainer.walkChildren(this.components, componentId, func);
  }

  static walkChildren(componentsMap, componentId, func, ind, isChild) {
    // Does not call callback on componentId this is called with.
    let component = componentsMap.get(componentId);
    let isCanceled = false;

    if (isChild) {
      func.call(null, component, ind, () => { isCanceled = true });
    }

    if (!isCanceled) {
      component.get('childIds').forEach((childId, ind) => {
        ComponentsContainer.walkChildren(componentsMap, childId, func, ind, true);
      });
    }
  }

  getRenderableProperties(componentId, attributeOptions) {
    return ComponentsContainer.getRenderableProperties(
      this.components,
      componentId,
      attributeOptions
    );
  }

  static getRenderableProperties(componentsMap, componentId, attributeOptions) {
    let attrToCssLookup = {};
    let attrToHtmlPropertyLookup = {
      text: true,
      src: true
    };

    // default attributes
    let attributes = ComponentsContainer.getAttributes(componentsMap, componentId);

    if (attributeOptions.state !== NONE || attributeOptions.breakpoint !== NONE) {
      Object.assign(
        attributes,
        ComponentsContainer.getAttributes(
          componentsMap,
          componentId,
          attributeOptions
        )
      );
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

  getRenderTree(componentId, context) {
    return ComponentsContainer.getRenderTree(this.components, componentId, context);
  }

  static getRenderTree(componentsMap, componentId, context, index) {
    /*

       context: {
       states: { id of component and state} - only if not none
       width
       }

       component stuff with:
       sx
       htmlProperties

       Later delete stuff
     */

    // TD: if I only take certain properties I can make this cheaper
    if (componentId) {
      let componentJs = componentsMap.get(componentId).toJS();
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

      let { sx, htmlProperties } = ComponentsContainer.getRenderableProperties(
        componentsMap,
        componentId,
        {
          breakpoint,
          state
        }
      );

      componentJs.sx = sx;
      componentJs.htmlProperties = htmlProperties;
      componentJs.index = index;
      componentJs.name = ComponentsContainer.getName(componentsMap, componentId);

      if (componentJs.parentId) {
        componentJs.parent = componentsMap.get(componentJs.parentId).toJS();
      }

      if (componentJs.masterId) {
        componentJs.master = componentsMap.get(componentJs.masterId).toJS();
      }

      let children = [];
      componentJs.childIds.forEach((id, ind) => {
        children.push(ComponentsContainer.getRenderTree(componentsMap, id, context, ind));
      });
      componentJs.children = children;

      return componentJs;
    } else {
      return null;
    }
  }

  hydrateComponent(componentId) {
    return ComponentsContainer.hydrateComponent(this.components, componentId);
  }

  static hydrateComponent(componentsMap, componentId) {
    // returns component with all ids replaced with references to the component
    /*
       adds props;
       index
     */
    let componentJs = componentsMap.get(componentId).toJS();
    componentJs.index = ComponentsContainer.getIndex(componentsMap, componentJs.id);

    componentJs.parent = componentsMap.get(componentJs.parentId).toJS();
    componentJs.master = componentsMap.get(componentJs.masterId).toJS();
    componentJs.children = [];
    componentJs.variants = [];

    componentJs.childIds.forEach((childId) => {
      componentJs.children.push(componentsMap.get(childId).toJs());
    });

    componentJs.variantIds.forEach((variantId) => {
      componentJs.variants.push(componentsMap.get(variantId).toJs());
    });

    return componentJs;
  }

  getIndex(componentId) {
    return ComponentsContainer.getIndex(this.components, componentId);
  }

  static getIndex(componentsMap, componentId) {
    let parent = componentsMap.get(componentsMap.getIn([componentId, 'parentId']));
    let index;
    parent.get('childIds').forEach((childId, childIndex) => {
      if (childId === componentId) {
        index = childIndex;
      }
    });

    return index;
  }

  // All user inputs must be escaped
  getHtml(componentId) {
    return ComponentsContainer.getHtml(this.components, componentId);
  }

  static getHtml(componentsMap, componentId) {
    // TD: this is total bloat. reduce the amount to bloat.
    // A simple optimization would be having all components share a class.
    const component = componentsMap.get(componentId);
    const id = component.get('id');
    const componentType = component.get('componentType');
    const attributes = ComponentsContainer.getAttributes(componentsMap, id);

    if (componentType === componentTypes.CONTAINER || componentType === componentTypes.ROOT) {
      const childStr = component.get('childIds').reduce((childStr, childId) => {
        return childStr + ComponentsContainer.getHtml(componentsMap, childId);
      }, '');
      return `<div class="${id}">${childStr}</div>`;
    } else if (componentType === componentTypes.HEADER) {
      // TD: add in user param for h num
      return `<h1 class="${id}">${attributes.text}</h1>`;
    } else if (componentType === componentTypes.TEXT) {
      return `<p class="${id}">${attributes.text}</p>`;
    } else if (componentType === componentTypes.IMAGE) {
      // need to use attr getter
      return `<img class="${id}" src="${attributes.src}" />`;
    }
  }

  getCss(componentId) {
    return ComponentsContainer.getCss(this.components, componentId);
  }

  static getCss(componentsMap, componentId) {
    // iterate all state and breakpoint types

    function attributesToString(attrs) {
      return _.reduce(attrs, (str, attrVal, attrKey) => {
        return str + camelToDash(attrKey) + ': ' + attrVal + ';\n';
      }, '');
    }

    const selectors = [];

    const defaultBody = attributesToString(
      ComponentsContainer.getAttributes(componentsMap, componentId)
    );

    if (defaultBody.length) {
      selectors.push(`.${componentId} { ${defaultBody} } `);
    }

    const breakpointMediumBody = attributesToString(
      ComponentsContainer.getAttributes(
        componentsMap,
        componentId,
        { breakpoint: breakpointTypes.MEDIUM }
      )
    );

    if (breakpointMediumBody.length) {
      selectors.push(`@media only screen and (min-device-width : 30rem) and (max-device-width : 60rem) { .${componentId} { ${breakpointMediumBody} } }`);
    }

    const breakpointLargeBody = attributesToString(
      ComponentsContainer.getAttributes(
        componentsMap,
        componentId,
        { breakpoint: breakpointTypes.LARGE }
      )
    );

    if (breakpointLargeBody.length) {
      selectors.push(`@media only screen and (min-device-width : 60rem) and (max-device-width : 60rem) { .${componentId} { ${breakpointLargeBody} } }`);
    }

    const hoverBody = attributesToString(
      ComponentsContainer.getAttributes(componentsMap, componentId, { state: stateTypes.HOVER })
    );

    if (hoverBody.length) {
      selectors.push(`.${componentId}:hover { ${hoverBody} } `);
    }

    return selectors.join('\n');
  }
}
