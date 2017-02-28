import React from 'react';
import {
  createImmutableJSSelector
} from './utils';

/*

  TD:
    factor out activePanel to be local state

 */



const Editor = React.createClass({
  getInitialState() {
    return {
      activeLeftPanel: leftPanelTypes.TREE
    }
  },
  render() {
    const {
      actions,
      activeComponentId,
      hoveredComponentId,
      renderTree,
      currentPage,
    } = this.props;

    const {
      activeLeftPanel
    } = this.state;

    let leftPanel, body;

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

      leftPanel = (
        <div>
          <HorizontalSelect
              className="w-100"
              options={[
                { value: leftPanelTypes.TREE, text: 'Tree' },
                { value: leftPanelTypes.DETAILS, text: 'Page Settings' },
              ]}
              activePanel={this.props.activePanel}
              onClick={(value) => { this.setState({ activeLeftPanel: value }); }}
          />
          <div className="ph1">
            {body}
          </div>
        </div>
      );
    }

    /*
       <div className="mb2 flex justify-center">
       <FormLabel className="mh2" name="Page">
       <PopupSelect
       value={currentPageName}
       className="f6 pv1">
       <PagesPopup
       pages={pages}
       currentPageId={currentPageId}
       currentPageName={currentPageName}
       actions={actions}
       />
       </PopupSelect>
       </FormLabel>
       </div>
     */

    return (
      <div className={classnames('flex h-100')}>
        <Sidebar direction="left">
          { leftPanel }
        </Sidebar>
        <div className="flex-auto flex flex-column h-100 mh4 relative">
          <ViewChoiceDropdown
              mainView={currentMainView}
              actions={actions}
          />
          <StaticRenderer
              actions={actions}
              renderTree={renderTree}
              context={context}
              width={width}
              currentPageId={currentPageId}
              currentPageName={currentPageName}
              pages={pages}
              actions={actions}
          />
        </div>
        <Sidebar direction="right">
          <Attributes
              componentName={componentName}
              componentType={componentType}
              attributes={attributes}
              componentId={componentId}
              componentState={componentState}
              componentBreakpoint={componentBreakpoint}
              actions={actions}
          />
        </Sidebar>
        <ComponentMenu actions={actions} />
        <OpenSiteModal actions={actions} />
      </div>
    );
  }
});

const editorViewSelector = createImmutableJSSelector(
  [
    state => state.get('activeComponentId'),
    state => state.get('hoveredComponentId'),
    renderTreeSelector,
    state => state.getIn(['pages', state.get('currentPageId')]),
  ],
  (activeComponentId, hoveredComponentId, renderTree, currentPage) => {
    return {
      activeComponentId,
      hoveredComponentId,
      renderTree,
      currentPage
    };
  }
)

export default connect(editorViewSelector)(Editor);
