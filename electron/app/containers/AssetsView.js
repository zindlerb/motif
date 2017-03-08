import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { remote } from 'electron';

import { createImmutableJSSelector } from '../utils';
import ViewChoiceDropdown from '../components/ViewChoiceDropdown';
import CartoonButton from '../components/CartoonButton';
import TextField from '../components/forms/TextField';

let dialog = remote.dialog;

const AssetIcon = React.createClass({
  getInitialState() {
    return {
      isHovering: false,
      isEditing: false
    }
  },
  render() {
    const { asset, actions } = this.props;
    const { isEditing, isHovering } = this.state;
    const { name, src } = asset;
    let editBar, input;

    if (isHovering) {
      editBar = (
        <div className="asset-edit-bar">
          <i
              className="fa fa-pencil-square-o ml2 v-mid"
              onClick={() => {
                  this.setState({ isEditing: true });
                }}
          />
          <i
              className="fa fa-trash ml2 v-mid"
              onClick={() => {
                  this.props.actions.deleteAsset(asset.id);
                }}
          />
        </div>
      );
    }

    if (isEditing) {
      input = (
        <TextField
            onSubmit={(value) => {
                this.setState({ isEditing: false });
                actions.updateAssetName(asset.id, value);
              }}
            value={asset.name}
        />
      );
    } else {
      input = <span>{name}</span>;
    }

    return (
      <div
          className="asset-icon"
          onMouseEnter={() => { this.setState({ isHovering: true }) }}
          onMouseLeave={() => { this.setState({ isHovering: false }) }}
      >
        <img src={src} />
        { input }
        { editBar }
      </div>
    );
  }
});

const AssetsView = React.createClass({
  render() {
    const { actions, currentMainView, assets } = this.props;
    let icons = assets.map((asset) => {
      return <AssetIcon asset={asset} actions={actions} />
    });

    if (icons.length === 0) {
      icons = (
        <div className="mt6 tc w-100">
          <span className="f3 hint">No assets. Click import to add some.</span>
        </div>
      );
    }

    return (
      <div className="h-100">
        <ViewChoiceDropdown
            mainView={currentMainView}
            actions={actions}
        />
        <div className="mh5 card">
          <h1 className="dib ma0">Images</h1>
          <CartoonButton
              className="v-mid mh2 mb2"
              text="Import"
              onClick={() => {
                  dialog.showOpenDialog({
                    title: 'Select an asset to import',
                    properties: ['openFile'],
                    filters: [
                      {
                        name: 'asset file',
                        extensions: ['jpeg', 'png', 'gif', 'svg']
                      }
                    ]
                  }, (filenames) => {
                    if (!filenames) return;
                    this.props.actions.addAsset(filenames[0]);
                  });
                }}
          />
          <div className="flex flex-wrap">
            {icons}
          </div>
        </div>
      </div>
    )
  }
});

const assetsSelector = createImmutableJSSelector(
  [
    state => state.get('assets'),
    state => state.get('currentMainView')
  ],
  (assets, currentMainView) => {
    return {
      currentMainView,
      assets: _.toArray(assets.toJS())
    }
  }
);

export default connect(assetsSelector)(AssetsView);
