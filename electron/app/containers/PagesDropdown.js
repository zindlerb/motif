import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';

import {
  createImmutableJSSelector,
} from '../utils';
import FormLabel from '../components/forms/FormLabel';
import PopupSelect from '../components/PopupSelect';
import PagesPopup from '../components/PagesPopup';

const PagesDropdown = React.createClass({
  render() {
    const {
      currentPageId,
      currentPageName,
      pages,
      actions
    } = this.props;

    return (
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
    );
  }
});

const pagesSelector = createImmutableJSSelector(
  state => state.get('pages'),
  (pages) => {
    return _.toArray(pages.toJS());
  }
)

const pagesDropdownSelector = createImmutableJSSelector(
  [
    pagesSelector,
    state => state.getIn(['pages', state.get('currentPageId')])
  ],
  (pages, currentPage) => {
    return {
      pages,
      currentPageName: currentPage.get('name'),
      currentPageId: currentPage.get('id'),
    };
  }
)

export default connect(pagesDropdownSelector)(PagesDropdown);
