var Immutable = require('immutable');

var { createImmutableJSSelector } = require('../app/utils.js');

describe('createImmutableJSSelector', () => {
  var wasCalled = false;
  var selector = createImmutableJSSelector(
    [
      obj => obj.color,
      obj => obj.map,
    ],
    (color, map) => {
      wasCalled = true;
      return color
    }
  );
  it('caches normal objects and immutable objects', () => {
    expect(selector({color: 'pink'}, Immutable.Map({x: 2}))).toBe('pink');
    expect(wasCalled).toBeTruthy();
    wasCalled = false;
    selector({color: 'pink'}, Immutable.Map({x: 2}));
    expect(wasCalled).toBeFalsy();
  });
});
