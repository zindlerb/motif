import { remote } from 'electron';
import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { image, createNewImageSpec } from '../base_components';
import HorizontalSelect from '../components/HorizontalSelect';
import CartoonButton from '../components/CartoonButton';

const iconList = [
  { name: 'PAGES', faClass: 'fa-files-o' },
  { name: 'COMPONENTS', faClass: 'fa-id-card-o' },
  { name: 'ASSETS', faClass: 'fa-file-image-o' },
];

let dialog = remote.dialog;

let dragSpec = {
  dragType: 'addComponent',
  onDrag(props, pos) {
    props.actions.updateComponentViewDropSpots(pos);
  },
  onEnd(props) {
    if (props.selectedComponentViewDropSpot) {
      props.onEnd();
    }

    props.actions.resetComponentViewDropSpots();
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
                this.props.actions.changeComponentName(this.props.component, this.state.tempName);
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
      componentBoxes,
      currentPageId,
      selectedComponentViewDropSpot,
      assets
    } = this.props;

    if (activePanel === 'COMPONENTS') {
      let componentBlockElements = {};
      _.forEach(componentBoxes, function (componentBlockArr, key) {
        componentBlockElements[key] = _.map(componentBlockArr, (component, ind) => {
          return (<ComponentBlock
                      onEnd={() => {
                          this.props.actions.addVariant(
                            component.id,
                            selectedComponentViewDropSpot.parent,
                            selectedComponentViewDropSpot.insertionIndex,
                          );
                        }}
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
            {componentBlockElements.ours}
          </ul>

          <h3 className="f5 pl3 pv2">Yours</h3>
          <ul>
            {componentBlockElements.yours}
          </ul>
        </div>
      );
    } else if (activePanel === 'PAGES') {
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
      body = (
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
    } else if (activePanel === 'ASSETS') {
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
    }

    return (
      <div>
        <HorizontalSelect
            onClick={(name) => {
                console.log('clicked');
                this.props.actions.changePanel(name, 'left');
              }}
            options={iconList}
            activePanel={this.props.activePanel}
            className="w-100"
        />
        {body}
      </div>
    );
  },
});

export default connect((state) => {
  const componentMap = state.siteComponents.components;

  const hydratedComponentBoxes = {
    yours: [],
    ours: []
  };

  _.forEach(state.componentBoxes, function (components, boxType) {
    _.forEach(components, function (id) {
      hydratedComponentBoxes[boxType].push(componentMap[id]);
    });
  });

  return {
    assets: state.assets,
    componentBoxes: hydratedComponentBoxes,
    pages: state.pages,
    activePanel: state.activeLeftPanel,
    selectedComponentViewDropSpot: state.selectedComponentViewDropSpot,
    currentPageId: state.currentPageId,
  }
}, null, null, { pure: false })(LeftPanel);
