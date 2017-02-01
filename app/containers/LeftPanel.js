import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import { connect } from 'react-redux';

import CartoonButton from '../components/CartoonButton';

const LeftPanel = React.createClass({
  render() {
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
  },
});

export default connect((state) => {
  return {
    pages: state.pages,
    currentPageId: state.currentPageId,
  }
}, null, null, { pure: false })(LeftPanel);
