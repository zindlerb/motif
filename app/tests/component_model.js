/* Janky testing of component model. will put in framework later */

import {Container, Header, Paragraph, Image} from '../base_components.js';

var runTests = true;
if (runTests) {
  var A = Container.createVariant({
    children: [
      Header.createVariant()
    ]
  });

  console.log('A.master === Container', A.master === Container);
  console.log('A.children[0].master === Header', A.children[0].master === Header);

  var B = A.createVariant(
    {
      attributes: {},
      variables: {}
    }
  );

  B.attributes.display = "something";

  console.log('B.getAllAttrs().display === "something"', B.getAllAttrs().display === "something");
  console.log('A.getAllAttrs().display === "flex"', A.getAllAttrs().display === "flex");
}
