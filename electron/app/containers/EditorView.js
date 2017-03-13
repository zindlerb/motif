import React from 'react';
import classnames from 'classnames';

import EditorRenderer from './EditorRenderer';
import Sidebar from '../components/Sidebar';
import AttributesContainer from './AttributesContainer';
import EditorLeftPanel from './EditorLeftPanel';
import OpenSiteModal from './OpenSiteModal';

const EditorView = React.createClass({
  render() {
    const {
      actions,
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
