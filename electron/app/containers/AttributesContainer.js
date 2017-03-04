import React from 'react';
import { connect } from 'react-redux';

import { createImmutableJSSelector } from '../utils';
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
    } = this.props;

    return (
      <Attributes
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
  ],
  (componentsMap, activeComponentId,
   activeComponentState, activeComponentBreakpoint) => {
     if (activeComponentId) {
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
           componentsMap,
           {
             state: activeComponentState,
             breakpoint: activeComponentBreakpoint,
           }),
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
