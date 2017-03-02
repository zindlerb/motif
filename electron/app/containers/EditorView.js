import React from 'react';
import classnames from 'classnames';

import ViewChoiceDropdown from '../components/ViewChoiceDropdown';
import PagesDropdown from './PagesDropdown';
import EditorRenderer from './EditorRenderer';
import Sidebar from '../components/Sidebar';
import EditorAttributes from './EditorAttributes';
import EditorLeftPanel from './EditorLeftPanel';
import ComponentMenu from '../components/ComponentMenu';
import OpenSiteModal from '../containers/OpenSiteModal';

const EditorView = React.createClass({
  render() {
    const {
      actions,
      currentMainView
    } = this.props;

    return (
      <div className={classnames('flex h-100')}>
        <Sidebar direction="left">
          <EditorLeftPanel />
        </Sidebar>
        <div className="flex-auto flex flex-column h-100 mh4 relative">
          <ViewChoiceDropdown
              mainView={currentMainView}
              actions={actions}
          />
          <PagesDropdown />
          <EditorRenderer />
        </div>
        <Sidebar direction="right">
          <EditorAttributes />
        </Sidebar>
        <ComponentMenu actions={actions} />
        <OpenSiteModal actions={actions} />
      </div>
    );
  }
});

export default EditorView;
