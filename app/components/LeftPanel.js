import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import $ from 'jquery';

import { DragSource } from 'react-dnd';
import { store, actionDispatch } from '../stateManager.js';
import { createDraggableComponent, dragManager } from '../dragManager.js';
import { getGlobalPosFromSyntheticEvent } from '../utils.js';
import HorizontalSelect from './HorizontalSelect.js';

const iconList = [
    { name: 'PAGES', faClass: 'fa-files-o' },
    { name: 'STYLE_GUIDE', faClass: 'fa-paint-brush' },
    { name: 'COMPONENTS', faClass: 'fa-id-card-o' },
    { name: 'ASSETS', faClass: 'fa-file-image-o' },
];

const ComponentBlock = createDraggableComponent({
  dragType: 'addComponent',
  onDrag(props, pos, ctx) {
    actionDispatch.setComponentMoveHighlight(pos);
  },
  onEnd(props, pos, ctx) {
    actionDispatch.addComponent(props.component);
  },
}, function (props) {
  return (
    <li ref={props.ref} onMouseDown={props.onMouseDown} className={classnames('m-auto componentBlock pv2 w4 draggableShadow mv2 tc list', props.className)}>
      {props.component.name}
    </li>
  );
});

function PlusButton(props) {
  return <i onClick={props.action} className="fa fa-plus-circle" aria-hidden="true" />;
}

const LeftPanel = React.createClass({
  getInitialState() {
    return { activeSitePanelTab: 'COMPONENTS' };
  },
  render() {
    let body;
    let { activePanel, pages, components, currentPage } = this.props;

    if (activePanel === 'COMPONENTS') {
      const defaultItems = _.map(components.ours, (component, ind) => <ComponentBlock component={component} key={ind} />);

      let userComponents;

      body = (
        <div>
          <h2 className="f4 pt2 pb3 tc">Components</h2>

          <h3 className="f5 pl3 pv2">Ours</h3>
          <ul className="list">
            {defaultItems}
          </ul>

          <h3 className="f5 pl3 pv2">Yours</h3>
          <ul>
            {userComponents}
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
            <PlusButton className="ph2 fl" action={actionDispatch.addPage} />
          </div>
          <ul>
            {pageList}
          </ul>
        </div>
            );
    }


    return (
      <div>
        <HorizontalSelect onClick={(name) => { actionDispatch.changePanel(name, 'left'); }} options={iconList} activePanel={this.props.activePanel} />
        {body}
      </div>
    );
  },
});

export default LeftPanel;
