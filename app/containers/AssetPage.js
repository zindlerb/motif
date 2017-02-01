import { remote } from 'electron';
import React from 'react';
let dialog = remote.dialog;

import { image, createNewImageSpec } from '../base_components';

import PlusButton from '../components/PlusButton';

const AssetIcon = React.createClass({
  getInitialState() {
    return {
      isHovering: false
    }
  },
  render() {
    const width = 100;
    return (
      <div
          style={{ width }}
          className={this.props.className}
          onMouseDown={this.props.onMouseDown}
          ref={this.props.ref}>
        <img style={{ width, height: 100 }} src={this.props.src} />
        <span>{this.props.name}</span>
      </div>
    );
  }
});

/*

let assetList = _.map(assets, function (asset) {
  return (
    <AssetIcon
        src={asset.src}
        onEnd={() => {
            this.props.actions.addVariant(
              image.id,
              selectedComponentViewDropSpot.parent,
              selectedComponentViewDropSpot.insertionIndex,
              createNewImageSpec(asset)
            );
          }}
        name={asset.name} />
  );
});

body = (
  <div>
    <div className="cf">
      <h2 className="f4 pt2 pb3 tc w-40 fl">Assets</h2>
      <PlusButton
          className="ph2 fl"
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
            }} />
    </div>
    <ul>
      {assetList}
    </ul>
  </div>
);

*/
