import { remote } from 'electron';
import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';

import { actionDispatch } from '../stateManager';
import { createDraggableComponent } from '../dragManager';
import HorizontalSelect from './HorizontalSelect';

const iconList = [
    { name: 'PAGES', faClass: 'fa-files-o' },
    { name: 'STYLE_GUIDE', faClass: 'fa-paint-brush' },
    { name: 'COMPONENTS', faClass: 'fa-id-card-o' },
    { name: 'ASSETS', faClass: 'fa-file-image-o' },
];

let dialog = remote.dialog;

let dragSpec = {
  dragType: 'addComponent',
  onDrag(props, pos) {
    actionDispatch.updateComponentViewDropSpots(pos);
  },
  onEnd(props) {
    if (props.selectedComponentViewDropSpot) {
      actionDispatch.addComponent(
        props.createComponent(),
        props.selectedComponentViewDropSpot.parent,
        props.selectedComponentViewDropSpot.insertionIndex
      );
    }

    actionDispatch.resetComponentViewDropSpots();
  },
}

const ComponentBlock = createDraggableComponent(dragSpec, React.createClass({
  getInitialState() {
    return {
      isHovering: false,
      isEditing: false,
    };
  },
  render() {
    let editMarker, content;

    if (this.state.isHovering) {
      editMarker = (
        <i
            onClick={() => { this.setState({ isEditing: true }); }}
            className="fa fa-pencil-square-o editSymbol"
            aria-hidden="true"
        />
      );
    }

    if (this.state.isEditing) {
      content = (
        <input
            className="w-60"
            focused
            type="text"
            value={this.state.tempName}
            onChange={(e) => { this.setState({ tempName: e.target.value }); }}
            onBlur={() => {
              actionDispatch.changeComponentName(this.props.component, this.state.tempName);
              this.setState({ isEditing: false });
            }}
        />
      );
    } else {
      content = this.props.component.name;
    }

    return (
      <li
          ref={this.props.ref}
          onMouseEnter={() => { this.setState({ isHovering: true }); }}
          onMouseLeave={() => { this.setState({ isHovering: false }); }}
          onMouseDown={this.props.onMouseDown}
          className={classnames(
              'm-auto componentBlock pv2 w4 draggableShadow mv2 tc list',
              this.props.className
            )}
      >
        {content}
        {editMarker}
      </li>
    );
  }
}));

const AssetIcon = createDraggableComponent(
  dragSpec,
  React.createClass({
    getInitialState() {
      return {
        isHovering: false
      }

    },
    render: function() {
      const width = 100;
      return (
        <div
            style={{width}}
            className={this.props.className}
            onMouseDown={this.props.onMouseDown}
            ref={this.props.ref}>
          <img style={{width, height: 100}} src={this.props.src}/>
          <span>{this.props.name}</span>
        </div>
      );
    }
  })
);

function PlusButton(props) {
  return <i onClick={props.onClick} className="fa fa-plus-circle" aria-hidden="true" />;
}

const LeftPanel = React.createClass({
  render() {
    let body;
    let {
      activePanel,
      pages,
      components,
      currentPage,
      selectedComponentViewDropSpot,
      assets
    } = this.props;

    if (activePanel === 'COMPONENTS') {
      let componentBlockElements = {};
      _.forEach(components, function (componentBlockArr, key) {
        componentBlockElements[key] = _.map(componentBlockArr, (component, ind) => {
          return (<ComponentBlock
                      createComponent={() => component.createVariant()}
                      component={component}
                      key={ind}
                      selectedComponentViewDropSpot={selectedComponentViewDropSpot}
                  />);
        });
      });

      body = (
        <div>
          <h2 className="f4 pt2 pb3 tc">Components</h2>

          <h3 className="f5 pl3 pv2">Ours</h3>
          <ul className="list">
            {componentBlockElements['ours']}
          </ul>

          <h3 className="f5 pl3 pv2">Yours</h3>
          <ul>
            {componentBlockElements['yours']}
          </ul>
        </div>
            );
    } else if (activePanel === 'PAGES') {
      const pageList = _.map(pages, function (page, ind) {
        return (
          <li
            className={classnames({ highlighted: page.id === currentPage.id })}
            onClick={() => actionDispatch.changePage(page)}
            key={ind}
          >
            {page.name}
          </li>);
      });
      body = (
        <div>
          <div className="cf">
            <h2 className="f4 pt2 pb3 tc w-40 fl">Pages</h2>
            <PlusButton className="ph2 fl" onClick={() => actionDispatch.addPage()} />
          </div>
          <ul>
            {pageList}
          </ul>
        </div>
      );
    } else if (activePanel === 'ASSETS') {
      let assetList = _.map(assets, function (asset) {
        return (
          <AssetIcon
              src={asset.src}
              createComponent={() => {
                  return image.createVariant({
                    name: asset.name,
                    attributes: { src: asset.src }
                  });
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
                      actionDispatch.addAsset(filenames[0]);
                    });
                  }} />
          </div>
          <ul>
            {assetList}
          </ul>
        </div>
      );
    }

    console.log('active panel', activePanel);

    return (
      <div>
        <HorizontalSelect onClick={(name) => {
            actionDispatch.changePanel(name, 'left');
          }} options={iconList} activePanel={this.props.activePanel} />
        {body}
      </div>
    );
  },
});

export default LeftPanel;
