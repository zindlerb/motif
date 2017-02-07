import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

import HorizontalSelect from '../components/HorizontalSelect';
import FormLabel from '../components/forms/FormLabel';
import TextField from '../components/forms/TextField';
import SidebarHeader from '../components/SidebarHeader';
import ComponentTree from '../components/ComponentTree';

/*
function Pages() {
  let {
    pages,
    currentPageId,
  } = this.props;

  const pageList = _.map(pages, (page, ind) => {
    const isActive = page.id === currentPageId;
    return (
      <li
          className={classnames({
              highlighted: isActive,
              'c-default': isActive,
              'c-pointer': !isActive
            }, 'pl2 pv1 page-item')}
          onClick={() => this.props.actions.changePage(page.id)}
          key={ind}
      >
        {page.name}
      </li>);
  });

  return (
    <div>
      <div className="tc">
        <h2 className="f4 mt3 mb2">Pages</h2>
        <CartoonButton
            text="New Page"
            onClick={() => this.props.actions.addPage()}
        />
      </div>
      <ul className="mt3">
        {pageList}
      </ul>
    </div>
  );
}
*/

const LeftPanel = React.createClass({
  render() {
    let body;
    let {
      actions,
      siteComponents,
      componentTreeId,
      activeComponentId,
      hoveredComponentId,
      activePanel,
      otherPossibleTreeViewDropSpots,
      selectedTreeViewDropSpot,
      currentPage,
    } = this.props;

    if (activePanel === 'TREE') {
      body = (
        <div>
          <SidebarHeader text="Component Tree" />
          <ComponentTree
              node={siteComponents.getRenderTree(componentTreeId)}
              actions={this.props.actions}
              context={{
                otherPossibleTreeViewDropSpots,
                selectedTreeViewDropSpot,
                activeComponentId,
                hoveredComponentId,
              }}
          />
        </div>
      );
    } else if (activePanel === 'DETAILS') {
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
              { name: 'TREE', src: 'public/img/assets/tree-icon.svg' },
              { name: 'DETAILS', faClass: 'fa-info-circle' },
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
  const currentPage = _.find(
    state.pages,
    page => page.id === state.currentPageId
  );

  return {
    activePanel: state.activeLeftPanel,
    activeComponentId: state.activeComponentId,
    hoveredComponentId: state.hoveredComponentId,
    componentTreeId: currentPage.componentTreeId,
    siteComponents: state.siteComponents,
    pages: state.pages,
    currentPageId: state.currentPageId,
    otherPossibleTreeViewDropSpots: state.otherPossibleTreeViewDropSpots,
    selectedTreeViewDropSpot: state.selectedTreeViewDropSpot,
  }
}, null, null, { pure: false })(LeftPanel);
