import React from 'react';
import { connect } from 'react-redux';

import FormLabel from '../components/forms/FormLabel';
import TextField from '../components/forms/TextField';
import ComponentTreeContainer from '../components/ComponentTreeContainer';
import HorizontalSelect from '../components/HorizontalSelect';
import { createImmutableJSSelector } from '../utils';
import { renderTreeSelector } from '../selectors';

const panelTypes = {
  TREE: 'TREE',
  DETAILS: 'DETAILS'
};

const EditorLeftPanel = React.createClass({
  getInitialState() {
    return {
      activePanel: panelTypes.TREE
    }
  },

  render() {
    const {
      actions,
      renderTree,
      currentPage,
      activeComponentId,
      hoveredComponentId
    } = this.props;

    const { activePanel } = this.state;
    let body;

    if (!currentPage) {
      return <h2 className="suggestion">No Page Selected</h2>;
    }

    if (activePanel === panelTypes.DETAILS) {
      const inputs = [
        { name: 'name', key: 'metaName' },
        { name: 'url', key: 'url' },
        { name: 'author', key: 'author' },
        { name: 'title', key: 'title' },
        { name: 'description', key: 'description', large: true },
        { name: 'keywords', key: 'keywords', large: true },
      ].map((input) => {
        return (
          <FormLabel name={input.name}>
            <TextField
                key={input.key}
                value={currentPage.get(input.key)}
                onSubmit={(value) => {
                    this.props.actions.setPageValue(input.key, value);
                  }}
                isLarge={input.large}
            />
          </FormLabel>
        );
      });

      body = (
        <div>
          { inputs }
        </div>
      );
    } else if (activePanel === panelTypes.TREE) {
      body = (
        <ComponentTreeContainer
            actions={actions}
            renderTree={renderTree}
            activeComponentId={activeComponentId}
            hoveredComponentId={hoveredComponentId}
        />
      );
    }

    return (
      <div className="h-100 flex flex-column">
        <HorizontalSelect
            className="w-100"
            options={[
              { value: panelTypes.TREE, text: 'Tree' },
              { value: panelTypes.DETAILS, text: 'Page Settings' },
            ]}
            activePanel={this.state.activePanel}
            onClick={(value) => { this.setState({ activePanel: value }); }}
        />
        <div className="f-grow">
          {body}
        </div>
      </div>
    );
  }
});

const editorLeftPanelSelector = createImmutableJSSelector(
  [
    renderTreeSelector,
    state => state.getIn(['pages', state.getIn(['editorView', 'currentPageId'])]),
    state => state.get('activeComponentId'),
    state => state.get('hoveredComponentId'),
  ],
  (renderTree, currentPage, activeComponentId, hoveredComponentId) => {
    return {
      renderTree,
      currentPage,
      activeComponentId,
      hoveredComponentId
    };
  }
);

export default connect(editorLeftPanelSelector)(EditorLeftPanel);
