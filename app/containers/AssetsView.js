import React from 'react';
import { createSelector } from 'reselect';
import _ from 'lodash';
import { connect } from 'react-redux';
import { remote } from 'electron';

import ViewChoiceDropdown from '../components/ViewChoiceDropdown';
import CartoonButton from '../components/CartoonButton';

let dialog = remote.dialog;

const EditableText = React.createClass({
  getInitialState() {
    return {
      tempText: '',
      isEditing: false
    }
  },

  render() {
    const {
      onSubmit,
      value,
    } = this.props;

    const {
      isEditing,
      tempText,
    } = this.state;

    if (isEditing) {
      return (
        <input
            focused={true}
            ref={(ref) => {
                if (ref && document.activeElement !== ref) {
                  ref.focus();
                }
              }}
            className="w-100"
            type="text"
            value={tempText}
            onChange={e => this.setState({
                tempText: e.target.value
              })}
            onBlur={(e) => {
                onSubmit(e.target.value);
                this.setState({ isEditing: false });
              }}
        />
      );
    } else {
      return (
        <div
            className="editable-text"
            onClick={() => {
                this.setState({
                  isEditing: true,
                  tempText: value
                });
              }}>
          {value}
        </div>
      );
    }
  }
});

const AssetIcon = React.createClass({
  getInitialState() {
    return {
      isHovering: false
    }
  },
  render() {
    const width = 100;
    const { asset, actions } = this.props;
    const { name, src } = asset;
    return (
      <div
          style={{ width }}
          className="asset-icon">
        <img style={{ width, height: 100 }} src={src} />
        <EditableText
            value={name}
            onSubmit={(value) => {
                actions.updateAssetName(asset.id, value)
              }}
        />
      </div>
    );
  }
});

const AssetsView = React.createClass({
  render() {
    //console.log('ASSETS VIEW RENDER');

    const { actions, currentMainView, assets } = this.props;
    const icons = assets.map((asset) => {
      return <AssetIcon asset={asset} actions={actions} />
    });

    return (
      <div>
        <ViewChoiceDropdown
            mainView={currentMainView}
            actions={actions}
        />
        <div className="mh6">
          <h1 className="dib">Images</h1>
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

const assetsSelector = createSelector(
  state => state.get('assets'),
  (assets) => {
    return _.toArray(assets.toJS());
  }
);

export default connect(
  (state) => {
    return {
      currentMainView: state.get('currentMainView'),
      assets: assetsSelector(state)
    }
  }
)(AssetsView);
