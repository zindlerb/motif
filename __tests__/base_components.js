var _ = require('lodash');

var {
  container,
  text,
  header,
  image,
  ComponentsContainer,
  defaultComponentsMap
  containerAttributes
} = require('../app/base_components.js');
var { stateTypes } = require('../app/constants.js');
var { guid } = require('../app/utils');

describe('base components', () => {
  it('copies the attributes correctly', () => {
    expect(container.get('defaultAttributes').toJS()).toEqual(containerAttributes);
  });
});

describe('createVariant', () => {
  let componentsContainer = new ComponentsContainer(defaultComponentsMap);

  var cvId = componentsContainer.createVariant(container.get('id'));
  var hvId = componentsContainer.createVariant(header.get('id'), {
    defaultAttributes: {
      test: 10
    }
  });

  componentsContainer.addChild(cvId, hvId);
  var cvvId = componentsContainer.createVariant(cvId);

  let components = componentsContainer.components;

  it('initializes new variant', () => {
    expect(
      components.getIn([cvId, 'defaultAttributes']).toJS()
    ).toEqual({});
  });

  it('copies spec', () => {
    expect(
      components.getIn([hvId, 'defaultAttributes', 'test'])
    ).toBe(10);
  });

  it('sets master variant relationship', () => {
    expect(components.getIn([header.get('id'), 'variantIds', 0])).toBe(hvId);
    expect(components.getIn([hvId, 'masterId'])).toBe(header.get('id'));
  });

  it('adds masters children to variant', () => {
    var hvvId = components.getIn([cvvId, 'childIds', 0]);
    expect(hvvId).toBeDefined();
    expect(components.getIn([hvvId, 'masterId'])).toBe(hvId);
  });
});


describe('addChild', () => {
  var compC = new ComponentsContainer(defaultComponentsMap);
  var cvId = compC.createVariant(container.get('id'));
  var cvvId = compC.createVariant(cvId);

  var hvId = compC.createVariant(header.get('id'));
  var hv2Id = compC.createVariant(header.get('id'));

  compC.addChild(cvId, hvId);
  compC.addChild(cvId, hv2Id);

  var components = compC.components;

  it('adds children and assigns parent', () => {
    expect(components.getIn([cvId, 'childIds']).size).toBe(2);
    expect(components.getIn([hvId, 'parentId'])).toBe(cvId);
  });

  var hv3Id = compC.createVariant(header.get('id'));
  compC.addChild(cvId, hv3Id, 1);

  it('inserts at correct index', () => {
    expect(compC.components.getIn([cvId, 'childIds', 1])).toBe(hv3Id);
    expect(compC.components.getIn([cvId, 'childIds']).size).toBe(3);
  });

  it('adds the children to variants', () => {
    expect(compC.components.getIn([cvvId, 'childIds']).size).toBe(3);
    expect(compC.components.getIn([cvvId, 'childIds', 1]) === hv3Id).toBeFalsy();
    expect(compC.components.getIn([hv3Id, 'variantIds']).size).toBe
  });
});

/*
   There's more:
   what does it do with variants of the deleted element?
   what does it do with children of the deleted element?
 */

describe('deleteComponent', () => {
  var componentsContainer = new ComponentsContainer(defaultComponentsMap);
  var badKidId = componentsContainer.createVariant(header.get('id'));
  var cvId = componentsContainer.createVariant(container.get('id'));
  var cvvId = componentsContainer.createVariant(cvId);
  componentsContainer.addChild(cvId, badKidId);
  componentsContainer.deleteComponent(badKidId);
  var components = componentsContainer.components;

  it('removes child from parent', () => {
    expect(components.getIn([cvId, 'childIds']).size).toBe(0);
  });

  it('removes self from component map', () => {
    expect(components.get(badKidId)).toBeUndefined();
  });

  it('removes child from variants', () => {
    expect(components.getIn([cvvId, 'childIds']).size).toBe(0);
  });
});

describe('moveComponent', () => {
  var componentsContainer = new ComponentsContainer(defaultComponentsMap);

  var cvId = componentsContainer.createVariant(container.get('id'));
  var cv2Id = componentsContainer.createVariant(container.get('id'));
  var hvId = componentsContainer.createVariant(header.get('id'));

  componentsContainer.addChild(cvId, cv2Id);
  componentsContainer.addChild(cvId, hvId);

  it('Moves child to new node', () => {
    expect(componentsContainer.components.getIn(
      [cvId, 'childIds', 1]
    )).toEqual(hvId);

    componentsContainer.moveComponent(hvId, cv2Id);
    var components = componentsContainer.components;
    expect(components.getIn([cvId, 'childIds']).size).toBe(1);
    expect(components.getIn([cv2Id, 'childIds', 0])).toEqual(hvId);
  });
});

describe('getAllAttrs', () => {
  var compC = new ComponentsContainer(defaultComponentsMap);
  var hvId = compC.createVariant(header.get('id'), {
    defaultAttributes: {
      backgroundColor: 'red',
      text: 'hi'
    }
  });

  var hvvId = compC.createVariant(hvId, {
    defaultAttributes: {
      text: 'no'
    }
  });

  var attrs = compC.getAttributes(hvvId);

  it('has the parents attrs', () => {
    expect(attrs.backgroundColor).toBe('red');
  });

  it('overwrites parent properties', () => {
    expect(attrs.text).toBe('no');
  });
});

describe('getRenderableProperties', () => {
  var compC = new ComponentsContainer(defaultComponentsMap);
  var cvId = compC.createVariant(container.get('id'));
  var hvId = compC.createVariant(header.get('id'), {
    defaultAttributes: {
      color: 'pink',
      text: 'hi'
    },
    states: {
      [stateTypes.HOVER]: {
        text: 'bye'
      }
    }
  });
  var ivId = compC.createVariant(image.get('id'));

  compC.addChild(cvId, hvId);
  compC.addChild(cvId, ivId);

  var renderTree = compC.getRenderTree(cvId, {
    width: 100,
    states: {
      [hvId]: stateTypes.HOVER
    },
  });

  it('hydrates the children', () => {
    expect(renderTree.children[1].id).toBeDefined();
  });

  it('gives the proper sx and htmlProperties', () => {
    var sx = renderTree.children[0].sx
    var htmlProperties = renderTree.children[0].htmlProperties;
    expect(sx.color).toBe('pink');
    expect(htmlProperties.text).toBe('bye');
  });
});

describe('walkChildren', () => {
  var compC = new ComponentsContainer(defaultComponentsMap);
  var vcId = compC.createVariant(container.get('id'));
  var vc2Id = compC.createVariant(container.get('id'));
  var viId = compC.createVariant(image.get('id'));
  var vtId = compC.createVariant(text.get('id'));
  var vhId = compC.createVariant(header.get('id'));
  compC.addChild(vcId, viId);
  compC.addChild(vcId, vtId);
  compC.addChild(vcId, vc2Id);
  compC.addChild(vc2Id, vhId);

  var walksSelf = false;
  var walkedChildren = {};

  compC.walkChildren(vcId, (child, ind) => {
    walkedChildren[child.get('id')] = { ind };
  });

  it('does not walk self', () => {
    expect(walkedChildren[vcId]).toBeUndefined();
  });

  it('walked all children', () => {
    expect(_.keys(walkedChildren).length).toBe(4);
  });

  it('gets the correct indexes', () => {
    expect(walkedChildren[vc2Id].ind).toBe(2);
    expect(walkedChildren[vhId].ind).toBe(0);
  });
});
