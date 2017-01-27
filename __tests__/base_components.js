var _ = require('lodash');

// Tests
var baseComponents = require('../app/base_components.js');

var DEFAULT = baseComponents.attributeStateTypes.DEFAULT;
var HOVER = baseComponents.attributeStateTypes.HOVER;
var containerAttributes = baseComponents.containerAttributes;

var container = baseComponents.container;
var text = baseComponents.text;
var header = baseComponents.header;
var image = baseComponents.image;
var SiteComponents = baseComponents.SiteComponents;

describe('base components', () => {
  it('copies the attributes correctly', () => {
    expect(container.attributes).toEqual(containerAttributes);
  });
});


describe('createVariant', () => {
  var siteComponents = new SiteComponents();
  var containerVariant = siteComponents.createVariant(container.id);

  it('copies spec properties correctly', () => {
    expect(containerVariant.attributes[DEFAULT]).toBeUndefined();

    var textVariant = siteComponents.createVariant(text.id, {
      attributes: {
        [DEFAULT]: { something: 12 }
      }
    });

    expect(textVariant.attributes[DEFAULT].something).toBe(12);

    var headerVariant = siteComponents.createVariant(header.id);

    expect(headerVariant.attributes[DEFAULT]).toBeUndefined();

    var imageVariant = siteComponents.createVariant(image.id);

    expect(imageVariant.attributes[DEFAULT]).toBeUndefined();
  });

  it('adds component to masters variants', () => {
    expect(container.variantIds[0]).toBe(containerVariant.id);
  });

  it('assigns master', () => {
    expect(containerVariant.masterId).toBe(container.id);
  });

  var hv = siteComponents.createVariant(header.id);

  var containerVariantWithChildren = siteComponents.createVariant(container.id, {
    childIds: [
      hv.id
    ]
  });

  var cVVWithChildren = siteComponents.createVariant(containerVariantWithChildren.id);

  var childId = containerVariantWithChildren.childIds[0];

  it('copies children in spec correctly', () => {
    expect(siteComponents.components[childId].parentId)
      .toBe(containerVariantWithChildren.id);
  });

  it('copies children to variants', () => {
    expect(cVVWithChildren.childIds.length).toBe(1);
  });
});

describe('addChild', () => {
  var siteComponents = new SiteComponents();
  var containerVariant = siteComponents.createVariant(container.id);
  var containerVariantVariant = siteComponents.createVariant(containerVariant.id);

  var headerVariant = siteComponents.createVariant(header.id);
  var headerVariant2 = siteComponents.createVariant(header.id);
  siteComponents.addChild(containerVariant.id, headerVariant.id);
  siteComponents.addChild(containerVariant.id, headerVariant2.id);

  it('adds children and assigns parent', () => {
    expect(containerVariant.childIds.length).toBe(2);
    expect(headerVariant.parentId).toBe(containerVariant.id);
  });

  it('inserts at correct index', () => {
    var headerVariant3 = siteComponents.createVariant(header.id);
    siteComponents.addChild(containerVariant.id, headerVariant3.id, 1);
    expect(containerVariant.childIds[1]).toBe(headerVariant3.id);
  });

  it('adds the children to variants', () => {
    expect(containerVariantVariant.childIds.length).toBe(3);
  });
});

describe('deleteComponent', () => {
  var siteComponents = new SiteComponents();
  var badKid = siteComponents.createVariant(header.id);
  var containerVariant = siteComponents.createVariant(container.id, {
    childIds: [badKid.id]
  });
  var containerVariantVariant = siteComponents.createVariant(containerVariant.id);

  siteComponents.deleteComponent(badKid.id);

  it('removes child from parent', () => {
    expect(containerVariant.childIds.length).toBe(0);
  });

  it('removes self from component map', () => {
    expect(siteComponents.components[badKid.id]).toBeUndefined();
  });

  it('removes child from variants', () => {
    expect(containerVariantVariant.childIds.length).toBe(0);
  });
});

describe('moveComponent', () => {
  var siteComponents = new SiteComponents();
  var cv = siteComponents.createVariant(container.id);
  var cv2 = siteComponents.createVariant(container.id);
  var hv = siteComponents.createVariant(header.id);

  siteComponents.addChild(cv.id, cv2.id);
  siteComponents.addChild(cv.id, hv.id);

  it('Moves child to new node', () => {
    expect(cv.childIds[1]).toEqual(hv.id);
    siteComponents.moveComponent(hv.id, cv2.id);
    expect(cv.childIds.length).toBe(1);
    expect(cv2.childIds[0]).toEqual(hv.id);
  });

});

describe('getAllAttrs', () => {
  var siteComponents = new SiteComponents();
  var hv = siteComponents.createVariant(header.id, {
    attributes: {
      [DEFAULT]: {
        backgroundColor: 'red',
        text: 'hi'
      }
    }
  });

  var hvv = siteComponents.createVariant(hv.id, {
    attributes: {
      [DEFAULT]: {
        text: 'no'
      }
    }
  });

  var attrs = siteComponents.getStateAttributes(hvv.id, DEFAULT);

  it('has the parents attrs', () => {
    expect(attrs.backgroundColor).toBe('red');
  });

  it('overwrites parent properties', () => {
    expect(attrs.text).toBe('no');
  });
});

describe('getRect', () => {
  // TD: involves dom elements so is trickier
});

describe('getRenderableProperties', () => {
  var siteComponents = new SiteComponents();
  var cv = siteComponents.createVariant(container.id);
  var hv = siteComponents.createVariant(header.id, {
    attributes: {
      [DEFAULT]: {
        color: 'pink',
        text: 'hi'
      },
      [HOVER]: {
        text: 'bye'
      }
    }
  });
  var iv = siteComponents.createVariant(image.id);

  siteComponents.addChild(cv.id, hv.id);
  siteComponents.addChild(cv.id, iv.id);

  var renderTree = siteComponents.getRenderTree(cv.id, {
    [hv.id]: HOVER
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
  var siteComponents = new SiteComponents();
  var vc = siteComponents.createVariant(container.id);
  var vc2 = siteComponents.createVariant(container.id);
  var vi = siteComponents.createVariant(image.id);
  var vt = siteComponents.createVariant(text.id);
  var vh = siteComponents.createVariant(header.id);
  siteComponents.addChild(vc.id, vi.id);
  siteComponents.addChild(vc.id, vt.id);
  siteComponents.addChild(vc.id, vc2.id);
  siteComponents.addChild(vc2.id, vh.id);

  var walksSelf = false;
  var walkedChildren = {};

  siteComponents.walkChildren(vc.id, (child, ind) => {
    walkedChildren[child.id] = {component: child, ind};
  });

  it('does not walk self', () => {
    expect(walkedChildren[vc.id]).toBeUndefined();
  });

  it('walked all children', () => {
    expect(_.keys(walkedChildren).length).toBe(4);
  });

  it('gets the correct indexes', () => {
    expect(walkedChildren[vc2.id].ind).toBe(2);
    expect(walkedChildren[vh.id].ind).toBe(0);
  });
});
