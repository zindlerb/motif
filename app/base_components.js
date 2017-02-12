import _ from 'lodash';
import Immutable from 'immutable';

import { guid } from './utils';
import {
  breakpointTypes,
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

export function ComponentsContainer(components) {
  /*
     Note:

     this.components is an immutable value.
     methods called on the ComponentsContainer instance
     reassign this.components with a new immutable value.

     There are private methods that operate on the this.components value.
     This is verbose but I like the seperation. Otherwise I would need to
     reassign this.components inside the methods that change this.components.
     This would make calling other methods more confusing.
   */

  this.components = Immutable.Map({
    [root.get('id')]: root,
    [container.get('id')]: container,
    [header.get('id')]: header,
    [text.get('id')]: text,
    [image.get('id')]: image,
  });

  if (components) {
    this.components = Immutable.fromJS(components);
  }

  // Reset on every render
  this.updateTree;

  // Reset on every dragEnd
  // Set on dragStart
  this.dropSpotCache;
  this.otherPossibleTreeViewDropSpots;
  this.selectedTreeViewDropSpot;
}

ComponentsContainer.prototype = {
  // Public

  //  Write
  createVariant(masterId, spec) {
    const variantId = guid();
    this.components = this._createVariant(this.components, variantId, masterId, spec);
    return variantId;
  },

  deleteComponent(deletedComponentId) {
    this.components = this._deleteComponent(this.components, deletedComponentId);
  },

  addChild(parentId, childId, ind) {
    this.components = this._addChild(this.components, parentId, childId, ind);
  },

  moveComponent(movedComponentId, newParentId, insertionIndex) {
    this.components = this._moveComponent(
      this.components,
      movedComponentId,
      newParentId,
      insertionIndex
    );
  },

  setAttribute(componentId, attributeName, newValue, attributeOptions) {
    this.components = this._setAttribute(
      this.components,
      componentId,
      attributeName,
      newValue,
      attributeOptions
    )
  },

  //  Read
  getAttributes(componentId, attributeOptions) {
    return this._getAttributes(this.components, componentId, attributeOptions);
  },

  getName(componentId) {
    return this._getName(this.components, componentId);
  },

  walkChildren(componentId, func) {
    this._walkChildren(this.components, componentId, func);
  },

  getRenderableProperties(componentId, attributeOptions) {
    return this._getRenderableProperties(this.components, componentId, attributeOptions);
  },

  getRenderTree(componentId, context) {
    return this._getRenderTree(this.components, componentId, context);
  },

  hydrateComponent(componentId) {
    return this._hydrateComponent(this.components, componentId);
  },

  getIndex(componentId) {
    return this._getIndex(this.components, componentId);
  },

  // Private
  _createVariant(componentMap, variantId, masterId, spec) {
    return componentMap.withMutations((components) => {
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
        this._createVariant(components, childVariantId, childId);
        this._addChild(
          components,
          variantId,
          childVariantId
        );
      });
    });
  },

  _deleteComponent(componentMap, deletedComponentId) {
    return componentMap.withMutations((components) => {
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
        this._deleteComponent(components, variantId);
      });
    });
  },

  // Component (All these methods assume the component specified by an id has been created)
  _addChild(componentMap, parentId, childId, ind) {
    return componentMap.withMutations((components) => {
      components.get(parentId).get('variantIds').forEach((variantId) => {
        let childVariantId = guid();
        this._createVariant(components, childVariantId, childId);
        this._addChild(
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
  },

  _moveComponent(componentMap, movedComponentId, newParentId, insertionIndex) {
    // Delete from parent and remove from all variants of parent
    return componentMap.withMutations((components) => {
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

      // TD: test this. Does what I'm doing here make sense?
      movedComponent.get('variantIds').forEach((variantId) => {
        this._deleteComponent(components, variantId);
      });

      this._addChild(components, newParentId, movedComponentId, insertionIndex);
    });
  },

  _setAttribute(componentMap, componentId, attributeName, newValue, attributeOptions) {
    return componentMap.withMutations((components) => {
      let component = components.get(componentId);

      if (attributeOptions) {
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
        }
      } else {
        component = component.setIn(['defaultAttributes', attributeName], newValue);
      }

      components.set(componentId, component);
    });
  },

  // Read
  _getAttributes(componentMap, componentId, attributeOptions) {
    let component = componentMap.get(componentId);
    const { state, breakpoint } = attributeOptions || { state: NONE, breakpoint: NONE };

    const masterId = component.get('masterId');
    let masterAttrs = {};
    let attributes;

    if (masterId) {
      masterAttrs = this._getAttributes(
        componentMap,
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
  },

  _getName(componentMap, componentId) {
    let component = componentMap.get(componentId);
    if (!component.get('name')) {
      return componentMap.get(component.get('masterId')).get('name');
    } else {
      return component.get('name');
    }
  },

  _walkChildren(componentMap, componentId, func, ind, isChild) {
    // Does not call callback on componentId this is called with.
    let component = componentMap.get(componentId);
    let isCanceled = false;

    if (isChild) {
      func.call(this, component, ind, () => { isCanceled = true });
    }

    if (!isCanceled) {
      component.get('childIds').forEach((childId, ind) => {
        this._walkChildren(componentMap, childId, func, ind, true);
      });
    }
  },

  _getRenderableProperties(componentMap, componentId, attributeOptions) {
    let attrToCssLookup = {};
    let attrToHtmlPropertyLookup = {
      text: true,
      src: true
    };

    // default attributes
    let attributes = this._getAttributes(componentMap, componentId);

    if (attributeOptions.state !== NONE || attributeOptions.breakpoint !== NONE) {
      Object.assign(attributes, this._getAttributes(componentMap, componentId, attributeOptions));
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
  },

  _getRenderTree(componentMap, componentId, context, index) {
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
      let componentJs = componentMap.get(componentId).toJS();
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

      let { sx, htmlProperties } = this._getRenderableProperties(
        componentMap,
        componentId,
        {
          breakpoint,
          state
        }
      );

      componentJs.sx = sx;
      componentJs.htmlProperties = htmlProperties;
      componentJs.index = index;
      componentJs.name = this._getName(componentMap, componentId);

      if (componentJs.parentId) {
        componentJs.parent = componentMap.get(componentJs.parentId).toJS();
      }

      if (componentJs.masterId) {
        componentJs.master = componentMap.get(componentJs.masterId).toJS();
      }

      let children = [];
      componentJs.childIds.forEach((id, ind) => {
        children.push(this._getRenderTree(componentMap, id, context, ind));
      });
      componentJs.children = children;

      return componentJs;
    } else {
      return null;
    }
  },

  _hydrateComponent(componentMap, componentId) {
    // returns component with all ids replaced with references to the component
    /*
       adds props;
       index
     */
    let componentJs = componentMap.get(componentId).toJS();
    componentJs.index = this._getIndex(componentMap, componentJs.id);

    componentJs.parent = componentMap.get(componentJs.parentId).toJS();
    componentJs.master = componentMap.get(componentJs.masterId).toJS();
    componentJs.children = [];
    componentJs.variants = [];

    componentJs.childIds.forEach((childId) => {
      componentJs.children.push(componentMap.get(childId).toJs());
    });

    componentJs.variantIds.forEach((variantId) => {
      componentJs.variants.push(componentMap.get(variantId).toJs());
    });

    return componentJs;
  },

  _getIndex(componentMap, componentId) {
    let parent = componentMap.get(componentMap.getIn([componentId, 'parentId']));
    let index;
    parent.get('childIds').forEach((childId, childIndex) => {
      if (childId === componentId) {
        index = childIndex;
      }
    });

    return index;
  }
}
