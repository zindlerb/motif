import { remote } from 'electron';
import React from 'react';
import { connect } from 'react-redux';

let dialog = remote.dialog;

const MenuBar = React.createClass({
  componentDidMount() {
    setInterval(() => {
      if (this.props.savedFilename) {
        this.saveSite();
      }
    }, 1000 * 60);
  },

  saveSite() {
    if (this.props.savedFilename) {
      // TD: make into action and use some redux async thing
      this.props.actions.saveSite(this.props.savedFilename);
    } else {
      dialog.showSaveDialog({
        title: 'Save Site',
        filters: [
          {
            name: 'motif file',
            extensions: ['json']
          }
        ]
      }, (filename) => {
        this.props.actions.saveSite(filename);
      });
    }
  },

  openSite() {
    dialog.showOpenDialog({
      title: 'Select a site to edit',
      properties: ['openFile'],
      filters: [
        {
          name: 'motif file',
          extensions: ['json']
        }
      ]
    }, (filenames) => {
      if (!filenames) return;
      this.props.actions.loadSite(filenames[0]);
    });
  },

  render() {
    return (
      <div>
        <button onClick={this.openSite}>Open</button>
        <button onClick={this.saveSite}>Save</button>
      </div>
    );
  }
})

export default connect(function (state) {
  return {
    savedFilename: state.fileMetaData.filename
  }
}, null, null, { pure: false })(MenuBar);
