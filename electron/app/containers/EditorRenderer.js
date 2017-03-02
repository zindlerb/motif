import React from 'react';
import { connect } from 'react-redux';

import { createImmutableJSSelector } from '../utils';
import { renderTreeSelector } from '../selectors';
import StaticRenderer from '../components/StaticRenderer';

const EditorRenderer = React.createClass({
  render() {
    const {
      renderTree,
      hoveredComponentId,
      activeComponentId,
      width,
      actions
    } = this.props;
    return (
      <StaticRenderer
          actions={actions}
          renderTree={renderTree}
          hoveredComponentId={hoveredComponentId}
          activeComponentId={activeComponentId}
          width={width}
      />
    );
  }
});

const editorRendererSelector = createImmutableJSSelector(
  [
    renderTreeSelector,
    state => state.get('hoveredComponentId'),
    state => state.get('activeComponentId'),
    state => state.get('rendererWidth')
  ],
  (renderTree, hoveredComponentId, activeComponentId, width) => {
    return {
      renderTree,
      hoveredComponentId,
      activeComponentId,
      width
    }
  }
)

export default connect(editorRendererSelector)(EditorRenderer);
