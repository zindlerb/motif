import _ from 'lodash';
import Immutable from 'immutable';
import { ComponentsContainer } from './base_components';

function serializerFactory() {
  const serializableKeys = [
    'siteName',
    'pages',
    'componentMap',
    'ourComponentBoxes',
    'yourComponentBoxes',
    'currentPageId',
    'assets',
    'componentsContainer',
    'recentSites'
  ];

  function serialize(state) {
    let serializableState = _.pick(state.toJS(), serializableKeys);
    serializableState.componentsContainer = serializableState.componentsContainer
                                                             .components
                                                             .toJS();
    return JSON.stringify(serializableState);
  }

  function deserialize(jsonState) {
    let stateData =  JSON.parse(jsonState);
    let componentsMap = stateData.componentsContainer;
    delete stateData.componentsContainer;
    let imState = Immutable.fromJS(stateData);
    return imState.set(
      'componentsContainer',
      new ComponentsContainer(componentsMap)
    );
  }

  return { serialize, deserialize };
}

const serializer = serializerFactory();

export default serializer;
