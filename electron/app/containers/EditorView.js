import React from 'react';
import classnames from 'classnames';

import ViewChoiceDropdown from '../components/ViewChoiceDropdown';
import PagesDropdown from './PagesDropdown';
import EditorRenderer from './EditorRenderer';
import Sidebar from '../components/Sidebar';
import AttributesContainer from './AttributesContainer';
import EditorLeftPanel from './EditorLeftPanel';
import OpenSiteModal from './OpenSiteModal';
import FullscreenButton from '../components/FullscreenButton';

const EditorView = React.createClass({
  render() {
    const {
      actions,
      currentMainView
    } = this.props;

    return (
      <div className={classnames('flex h-100')}>
        <Sidebar direction="left">
          <EditorLeftPanel actions={actions} />
        </Sidebar>
        <EditorRenderer actions={actions} />
        <Sidebar direction="right">
          <AttributesContainer actions={actions} />
        </Sidebar>
        <OpenSiteModal actions={actions} />
      </div>
    );
  }
});

export default EditorView;
