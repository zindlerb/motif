import React from 'react';
import FormLabel from '../components/forms/FormLabel';
import TextField from '../components/forms/TextField';
import ComponentTreeContainer from '../components/ComponentTreeContainer';

const panelTypes = {
  TREE: 'TREE',
  DETAILS: 'DETAILS'
}

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

    if (!currentPage) {
      leftPanel = <h2 className="suggestion">No Page Selected</h2>;
    } else {
      if (activeLeftPanel === leftPanelTypes.DETAILS) {
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
      } else if (activeLeftPanel === leftPanelTypes.TREE) {
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
        <Sidebar direction="left">
          <div>
            <HorizontalSelect
                className="w-100"
                options={[
                  { value: leftPanelTypes.TREE, text: 'Tree' },
                  { value: leftPanelTypes.DETAILS, text: 'Page Settings' },
                ]}
                activePanel={this.props.activePanel}
                onClick={(value) => { this.setState({ activePanel: value }); }}
            />
            <div className="ph1">
              {body}
            </div>
          </div>
        </Sidebar>
      );
    }
  }
});

const editorLeftPanelSelector = createImmutableJSSelector(
  [
    state => state.getIn(['pages', state.get('currentPageId')]),
    state => state.get('activeComponentId'),
    state => state.get('hoveredComponentId'),
    renderTreeSelector
  ],
  (renderTree, currentPage, activeComponentId, hoveredComponentId) => {
    return {
      renderTree,
      currentPage,
      activeComponentId,
      hoveredComponentId
    };
  }
)

export default connect(editorLeftPanelSelector)(EditorLeftPanel);
