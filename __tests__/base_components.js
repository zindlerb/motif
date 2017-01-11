// Tests

var baseComponents = require('../app/base_components.js');

var container = baseComponents.container;
var text = baseComponents.text;
var header = baseComponents.header;
var image = baseComponents.image;

test('createVariant', () => {
  var containerVariant = container.createVariant();

  it('copies spec properties correctly', () => {
    expect(containerVariant.attributes).toEqual({});

    var textVariant = text.createVariant({
      attributes: { something: 12 }
    });

    expect(textVariant.attributes.something).toBe(12);

    var headerVariant = header.createVariant();

    expect(headerVariant.attributes).toEqual({});

    var imageVariant = image.createVariant();

    expect(imageVariant.attributes).toEqual({});
  });

  it('adds component to masters variants', () => {
    expect(container._variants[0].id).toBe(containerVariant.id);
  });

  it('assigns master', () => {
    expect(containerVariant.master.id).toBe(container.id);
  });

  var containerVariantWithChildren = container.createVariant({
    children: [
      header.createVariant()
    ]
  });

  var cVVWithChildren = containerVariantWithChildren.createVariant();

  it('copies children in spec correctly', () => {
    expect(containerVariantWithChildren.children[0].parent.id)
      .toBe(containerVariantWithChildren.id);
  });

  it('copies children to variants', () => {
    expect(cVVWithChildren.children.length).toBe(1);
  });


});

test('addChild', () => {
  var containerVariant = container.createVariant();
  var containerVariantVariant = containerVariant.createVariant();

  var headerVariant = header.createVariant();
  var headerVariant2 = header.createVariant();
  containerVariant.addChild(headerVariant);
  containerVariant.addChild(headerVariant2);

  it('adds children and assigns parent', () => {
    expect(containerVariant.children.length).toBe(2);
    expect(headerVariant.parent.id).toBe(containerVariant.id);
  });

  it('inserts at correct index', () => {
    var headerVariant3 = header.createVariant();
    containerVariant.addChild(headerVariant3, 1);
    expect(containerVariant.children[1].id).toBe(headerVariant3.id);
  });

  it('adds the children to variants', () => {
    expect(containerVariantVariant.children.length).tobe(3);
  });
});

test('removeChild', () => {
  //Td think about how this effects

  var badKid = header.createVariant();
  var containerVariant = container.createVariant({
    children: [badKid]
  });
  var containerVariantVariant = container.createVariant();

  containerVariant.removeChild(badKid);

  it('removes child from parent', () => {
    expect(containerVariant.children.length).toBe(0);
  });

  it('removes parent', () => {
    expect(badKid.parent).toBeUndefined();
  });

  it('removes child from variants', () => {
    expect(containerVariantVariant.children.length).toBe(0);
  });
});

test('removeSelf', () => {
  var badKid = header.createVariant();
  var containerVariant = container.createVariant({
    children: [badKid]
  });
  var master = badKid.master;
  badKid.removeSelf();
  it('remove the variantReference', () => {
    expect(master._variants.length).toBe(0);
  });
});

test('getAllAttrs', () => {
  var hv = header.createVariant({
    attributes: {
      backgroundColor: 'red',
      text: 'hi'
    }
  });

  var hvv = hv.createVariant({
    attributes: {
      text: 'no'
    }
  });

  var attrs = hvv.getAllAttrs();

  it('has the parents attrs', () => {
    expect(attrs.backgroundColor).toBe('red');
  });

  it('overwrites parent properties', () => {
    expect(attrs.text).toBe('no');
  });
});

test('getRect', () => {
  // TD: involves dom elements so is trickier
});

test('isLastChild', () => {
  var vc = container.createVariant();
  var vi = image.createVariant();
  var vt = text.createVariant();
  vc.addChild(vi);
  vc.addChild(vt);

  expect(vi.isLastChild()).toBeFalsy();
  expect(vt.isLastChild()).toBeTruthy();
});

test('isFirstChild', () => {
  var vc = container.createVariant();
  var vi = image.createVariant();
  var vt = text.createVariant();
  vc.addChild(vi);
  vc.addChild(vt);

  expect(vi.isFirstChild()).toBeTruthy();
  expect(vt.isFirstChild()).toBeFalsy();
});

test('getInd', () => {
  var vc = container.createVariant();
  var vi = image.createVariant();
  var vt = text.createVariant();
  var vh = header.createVariant();
  vc.addChild(vi);
  vc.addChild(vt);
  vc.addChild(vh);

  expect(vi.getInd()).toBe(0);
  expect(vt.getInd()).toBe(1);
  expect(vh.getInd()).toBe(2);
});

test('walkChildren', () => {
  var vc = container.createVariant();
  var vc2 = container.createVariant();
  var vi = image.createVariant();
  var vt = text.createVariant();
  var vh = header.createVariant();
  vc.addChild(vi);
  vc.addChild(vt);
  vc.addChild(vc2);

  vc2.addChild(vh);

  var walksSelf = false;
  var walkedChildren = {};

  vc.walkChildren((child, ind) => {
    walkedChildren[child.id] = {component: child, ind};
  });

  it('does not walk self', () => {

  });

  it('walked all children', () => {

  });

  it('gets the correct indexes', () => {

  });
});
