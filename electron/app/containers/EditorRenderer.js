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
      currentMainView,
      isFullscreen,
      actions
    } = this.props;
    return (
      <StaticRenderer
          actions={actions}
          setRendererWidth={actions.setEditorViewWidth}
          renderTree={renderTree}
          hoveredComponentId={hoveredComponentId}
          activeComponentId={activeComponentId}
          currentMainView={currentMainView}
          isFullscreen={isFullscreen}
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
    state => state.getIn(['editorView', 'rendererWidth']),
    state => state.get('currentMainView'),
    state => state.get('isFullscreen'),
  ],
  (renderTree, hoveredComponentId, activeComponentId,
   width, currentMainView, isFullscreen) => {
    return {
      renderTree,
      hoveredComponentId,
      activeComponentId,
      width,
      currentMainView,
      isFullscreen
    }
  }
)

export default connect(editorRendererSelector)(EditorRenderer);
