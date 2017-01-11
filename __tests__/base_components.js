// Tests

var baseComponents = require('../app/base_components.js');

console.log('baseComponents', baseComponents);

test('create variant', () => {
  var containerVariant = baseComponents.container.createVariant();
  var textVariant = baseComponents.text.createVariant();
  var headerVariant = baseComponents.header.createVariant();
  var imageVariant = baseComponents.image.createVariant();


});
