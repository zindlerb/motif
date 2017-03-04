import React from 'react';
import { connect } from 'react-redux';

import { ComponentsContainer } from '../base_components';
import ComponentTreeContainer from '../components/ComponentTreeContainer';
import { createImmutableJSSelector } from '../utils';

const ComponentsViewTree = React.createClass({
  render() {
    const {
      actions,
      renderTree,
      activeComponentId,
      hoveredComponentId
    } = this.props;

    return (
      <ComponentTreeContainer
               actions={actions}
               renderTree={renderTree}
               activeComponentId={activeComponentId}
               hoveredComponentId={hoveredComponentId}
      />
    );
  }
});

const componentsViewTreeSelector = createImmutableJSSelector(
  [
    state => state.get('activeComponentId'),
    state => state.get('hoveredComponentId'),
    state => state.get('componentsMap'),
    state => state.getIn(['componentsView', 'currentComponentId']),
  ],
  (activeComponentId, hoveredComponentId, componentsMap, currentComponentId) => {
    return {
      activeComponentId,
      hoveredComponentId,
      renderTree: ComponentsContainer.getRenderTree(componentsMap, currentComponentId)
    }
  }
)

export default connect(componentsViewTreeSelector)(ComponentsViewTree);
