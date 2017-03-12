import React from 'react';
import { connect } from 'react-redux';

import { createImmutableJSSelector } from '../utils';
import { mainViewTypes } from '../constants';
import { ComponentsContainer } from '../base_components';
import Attributes from '../components/Attributes';

const AttributesContainer = React.createClass({
  render() {
    const {
      componentName,
      componentType,
      attributes,
      componentId,
      componentState,
      componentBreakpoint,
      actions,
      showButtons,
      isSynced
    } = this.props;

    return (
      <Attributes
          showButtons={showButtons}
          isSynced={isSynced}
          componentName={componentName}
          componentType={componentType}
          attributes={attributes}
          componentId={componentId}
          componentState={componentState}
          componentBreakpoint={componentBreakpoint}
          actions={actions}
      />
    );
  }
})

const attributesSelector = createImmutableJSSelector(
  [
    state => state.get('componentsMap'),
    state => state.get('activeComponentId'),
    state => state.get('activeComponentState'),
    state => state.get('activeComponentBreakpoint'),
    state => state.get('currentMainView'),
  ],
  (componentsMap, activeComponentId,
   activeComponentState, activeComponentBreakpoint,
   currentMainView) => {
     if (activeComponentId) {
       const component = componentsMap.get(activeComponentId);
       return {
         componentName: ComponentsContainer.getName(
           componentsMap,
           activeComponentId
         ),
         componentType: componentsMap.getIn([
           activeComponentId,
           'componentType'
         ]),
         attributes: ComponentsContainer.getAttributes(
           componentsMap,
           activeComponentId,
           {
             state: activeComponentState,
             breakpoint: activeComponentBreakpoint,
           }
         ),
         showButtons: mainViewTypes.EDITOR === currentMainView,
         isSynced: component.get('isSynced'),
         componentId: activeComponentId,
         componentState: activeComponentState,
         componentBreakpoint: activeComponentBreakpoint,
       }
     } else {
       return {};
     }
   }
);

export default connect(attributesSelector)(AttributesContainer);
