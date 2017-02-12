import React from 'react';
import { connect } from 'react-redux';

import { leftPanelTypes } from '../constants';
import HorizontalSelect from '../components/HorizontalSelect';
import FormLabel from '../components/forms/FormLabel';
import TextField from '../components/forms/TextField';
import SidebarHeader from '../components/SidebarHeader';
import ComponentTree from '../components/ComponentTree';

const LeftPanel = React.createClass({
  render() {
    let body;
    let {
      actions,
      activePanel,
      activeComponentId,
      hoveredComponentId,
      componentsContainer,
      componentTreeId,
      currentPageId,
      currentPage,
      otherPossibleTreeViewDropSpots,
      selectedTreeViewDropSpot
    } = this.props;

    if (!currentPageId) {
      body = (
        <h2 className="suggestion">No Page Selected</h2>
      );
    } else if (activePanel === leftPanelTypes.TREE) {
      let componentTreeElement;

      if (componentTreeId) {
        componentTreeElement = (
          <ComponentTree
              node={componentsContainer.getRenderTree(componentTreeId)}
              actions={this.props.actions}
              context={{
                otherPossibleTreeViewDropSpots,
                selectedTreeViewDropSpot,
                activeComponentId,
                hoveredComponentId,
              }}
          />
        );
      } else {
        componentTreeElement = (
          <p>Please select a page</p>
        );
      }

      body = (
        <div>
          <SidebarHeader text="Component Tree" />
          { componentTreeElement }
        </div>
      );
    } else if (activePanel === leftPanelTypes.DETAILS) {
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
                value={currentPage[input.key]}
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
          <SidebarHeader text="Page Settings" />
          { inputs }
        </div>
      );
    }

    return (
      <div>
        <HorizontalSelect
            className="w-100"
            options={[
              { value: leftPanelTypes.TREE, src: 'public/img/assets/tree-icon.svg' },
              { value: leftPanelTypes.DETAILS, faClass: 'fa-info-circle' },
            ]}
            activePanel={this.props.activePanel}
            onClick={(name) => { actions.changePanel(name, 'left'); }}
        />
        <div className="ph1">
          {body}
        </div>
      </div>
    );
  },
});

export default connect((state) => {
  /*
     Next:
       make sure new props from connect work with component.
   */

  return {
    activePanel: state.get('activeLeftPanel'),
    activeComponentId: state.get('activeComponentId'),
    hoveredComponentId: state.get('hoveredComponentId'),
    componentsContainer: state.get('componentsContainer'),
    componentTreeId: state.getIn(['pages', state.get('currentPageId'), 'componentTreeId']),
    currentPageId: state.get('currentPageId'),
    currentPage: state.getIn(['pages', state.get('currentPageId')]),
    otherPossibleTreeViewDropSpots: state.get('otherPossibleTreeViewDropSpots') && state.get('otherPossibleTreeViewDropSpots').toJS(),
    selectedTreeViewDropSpot: state.get('selectedTreeViewDropSpot') && state.get('selectedTreeViewDropSpot').toJS(),
  }
}, null, null, { pure: false })(LeftPanel);
