import _ from 'lodash';
import { SiteComponents } from './base_components';

function serializerFactory() {
  const serializableKeys = [
    'siteName',
    'pages',
    'componentMap',
    'componentBoxes',
    'currentPageId',
    'assets',
    'siteComponents',
    'recentSites'
  ];

  function serialize(state) {
    let serializableState = _.pick(state, serializableKeys);
    serializableState.siteComponents = serializableState.siteComponents.components;

    return JSON.stringify(serializableState);
  }

  function deserialize(jsonState) {
    let stateData = JSON.parse(jsonState);
    stateData.siteComponents = new SiteComponents(stateData.siteComponents);

    return stateData;
  }

  return { serialize, deserialize };
}

const serializer = serializerFactory();

export default serializer;
