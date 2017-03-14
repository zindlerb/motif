import React from 'react';
import { connect } from 'react-redux';

import { ComponentsContainer } from '../base_components';
import { createImmutableJSSelector } from '../utils';
import { componentTreeMetadataSelector } from '../selectors';
import StaticRenderer from '../components/StaticRenderer';

const ComponentViewRenderer = React.createClass({
  render() {
    const {
      renderTree,
      componentsList,
      currentMainView,
      currentComponentId,
      hoveredComponentId,
      activeComponentId,
      rendererWidth,
      isFullscreen,
      currentComponentName,
      isFullscreenLocked,
      isCurrentComponentDefault,
      actions
    } = this.props;

    return (
      <StaticRenderer
          actions={actions}
          renderTree={renderTree}
          hoveredComponentId={hoveredComponentId}
          isFullscreen={isFullscreen}
          activeComponentId={activeComponentId}
          setRendererWidth={actions.setComponentsViewWidth}
          currentMainView={currentMainView}
          componentsList={componentsList}
          currentComponentName={currentComponentName}
          currentComponentId={currentComponentId}
          isFullscreenLocked={isFullscreenLocked}
          isCurrentComponentDefault={isCurrentComponentDefault}
          width={rendererWidth}
      />
    );
  }
});

const componentsListSelector = createImmutableJSSelector(
  [
    state => state.get('ourComponentBoxes'),
    state => state.get('yourComponentBoxes'),
    state => state.get('componentsMap')
  ],
  (ourComponentBoxes, yourComponentBoxes, componentsMap) => {
    const componentsList = [];

    [ourComponentBoxes, yourComponentBoxes].forEach((componentBoxes) => {
      componentBoxes.forEach((componentId) => {
        componentsList.push({
          text: ComponentsContainer.getName(componentsMap, componentId),
          value: componentId
        });
      });
    });

    return componentsList;
  }
)

const componentViewRendererSelector = createImmutableJSSelector(
  [
    componentsListSelector,
    componentTreeMetadataSelector,
    state => state.get('componentsView'),
    state => state.get('componentsMap'),
    state => state.get('currentMainView'),
    state => state.get('isFullscreen'),
    state => state.get('isFullscreenLocked'),
  ],
  (componentsList, componentTreeMetadata, componentsView,
   componentsMap, currentMainView, isFullscreen, isFullscreenLocked) => {
     const currentComponentId = componentsView.get('currentComponentId');

     return Object.assign({
       componentsList,
       rendererWidth: componentsView.get('rendererWidth'),
       currentComponentId,
       currentComponentName: ComponentsContainer.getName(
         componentsMap,
         currentComponentId
       ),
       renderTree: ComponentsContainer.getRenderTree(
         componentsMap,
         componentsView.get('currentComponentId')
       ),
       isCurrentComponentDefault: componentsMap.getIn([currentComponentId, 'isDefaultComponent']),
       currentMainView,
       isFullscreen,
       isFullscreenLocked
     }, componentTreeMetadata);
   }
);

export default connect(componentViewRendererSelector)(ComponentViewRenderer);
