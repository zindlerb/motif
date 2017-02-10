import React from 'react';
import { connect } from 'react-redux';

import { saveSiteDialog, loadSiteDialog } from '../utils';
import CartoonButton from '../components/CartoonButton';

function SiteItem(props) {
  return (
    <div className="site-item" onClick={props.onClick}>
      <i className="fa fa-files-o" aria-hidden="true" />
      {props.name}
    </div>
  );
}

const OpenSiteModal = React.createClass({
  render() {
    let recentSitesBlock;
    const { recentSites } = this.props;

    if (recentSites.length) {
      const recentSiteItems = recentSites.map((recentSite) => {
        return (
          <SiteItem
              name={recentSite.name}
              onClick={() => this.props.actions.loadSite(recentSite.path)}
          />
        );
      });

      recentSitesBlock = (
        <div>
          <h2>Recent Sites</h2>
          { recentSiteItems }
        </div>
      )
    }

    if (this.props.isOpen) {
      return (
        <div className="dark-background">
          <div className="modal-card">
            <h1 className="tc f1 mt0">Sites</h1>
            <div className="tc">
              <CartoonButton
                  text="New"
                  onClick={() => saveSiteDialog(this.props.actions)}
                  size="medium"
              />
              <CartoonButton
                  className="ml2"
                  text="Open"
                  onClick={() => loadSiteDialog(this.props.actions)}
                  size="medium"
              />
            </div>
            { recentSitesBlock }
          </div>
        </div>
      );
    } else {
      return <div />;
    }
  }
});

export default connect(
  function (state) {
    return {
      isOpen: !state.hasIn(['fileMetaData', filename]),
      recentSites: state.get('recentSites').toJS()
    }
  }
)(OpenSiteModal);
