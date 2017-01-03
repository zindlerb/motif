/* Janky testing of component model. will put in framework later */

import { Container, Header } from '../base_components';

const runTests = false;
if (runTests) {
  const A = Container.createVariant({
    children: [
      Header.createVariant(),
    ],
  });

  console.log('A.master === Container', A.master === Container);
  console.log('A.children[0].master === Header', A.children[0].master === Header);

  const B = A.createVariant({
    attributes: {},
    variables: {},
  });

  B.attributes.display = 'something';
  console.log("B.getAllAttrs().display === 'something'", B.getAllAttrs().display === 'something');
  console.log("A.getAllAttrs().display === 'flex'", A.getAllAttrs().display === 'flex');
}
