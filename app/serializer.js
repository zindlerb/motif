import _ from 'lodash';
import Immutable from 'immutable';

function serializerFactory() {
  const serializableKeys = [
    'siteName',
    'pages',
    'componentMap',
    'ourComponentBoxes',
    'yourComponentBoxes',
    'currentPageId',
    'assets',
    'componentsMap',
    'recentSites'
  ];

  function serialize(state) {
    let serializableState = _.pick(state.toJS(), serializableKeys);
    return JSON.stringify(serializableState);
  }

  function deserialize(jsonState) {
    return Immutable.fromJS(JSON.parse(jsonState));
  }

  return { serialize, deserialize };
}

const serializer = serializerFactory();

export default serializer;
