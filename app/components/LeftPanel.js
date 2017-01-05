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

const ComponentBlock = createDraggableComponent({
  dragType: 'addComponent',
  onDrag(props, pos) {
    actionDispatch.setComponentMoveHighlight(pos);
  },
  onEnd(props, pos) {
    actionDispatch.addComponent(props.component);
  },
}, React.createClass({
  getInitialState() {
    return {
      isHovering: false,
      isEditing: false,
    };
  },
  beginHover() {

  },
  endHover() {

  },
  render() {
    let editMarker, content;
    if (this.state.isHovering) {
      editMarker = (
        <i
            onClick={() => { this.setState({isEditing: true}); }}
            className="fa fa-pencil-square-o editSymbol"
            aria-hidden="true"
        />
      );
    }

    if (this.state.isEditing) {
      content = (
        <input
            className="w-60"
            focused={true}
            type="text"
            value={this.state.tempName}
            onChange={(e) => { this.setState({tempName: e.target.value}) }}
            onBlur={() => {
                actionDispatch.changeComponentName(this.props.component, this.state.tempName);
                this.setState({isEditing: false});
              }}
        />
      )
    } else {
      content = this.props.component.name;
    }

    return (
      <li
          ref={this.props.ref}
          onMouseEnter={() => { this.setState({isHovering: true}) }}
          onMouseLeave={() => { this.setState({isHovering: false}) }}
          onMouseDown={this.props.onMouseDown}
          className={classnames(
              'm-auto componentBlock pv2 w4 draggableShadow mv2 tc list',
              this.props.className
            )}>
        {content}
        {editMarker}
      </li>
    );
  }
}));

function PlusButton(props) {
  return <i onClick={props.action} className="fa fa-plus-circle" aria-hidden="true" />;
}

const LeftPanel = React.createClass({
  render() {
    let body;
    let { activePanel, pages, components, currentPage } = this.props;

    if (activePanel === 'COMPONENTS') {
      const defaultItems = _.map(components.ours, (component, ind) => <ComponentBlock component={component} key={ind} />);

      let userComponents = _.map(components.yours, (component, ind) => <ComponentBlock component={component} key={ind} />);

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
