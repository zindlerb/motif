import React from 'react';
import classnames from 'classnames';
import {
  focusRefCallback
} from '../utils';
import UpArrow from '../components/UpArrow';

const PagesPopup = React.createClass({
  getInitialState() {
    return {
      isEditing: false,
      tempText: ''
    }
  },
  render() {
    const { pages, currentPageId, currentPageName, actions } = this.props;
    const { isEditing, tempText } = this.state;
    let isActive;
    let pageComponents = pages.map((page) => {
      isActive = page.id === currentPageId;

      if (isActive && isEditing) {
        return (
          <li key={page.id}>
            <input
                value={tempText}
                ref={focusRefCallback}
                onChange={(e) => { this.setState({ tempText: e.target.value }) }}
                onBlur={(e) => {
                    actions.setPageValue('name', e.target.value);
                    this.setState({ isEditing: false, tempText: '' });
                  }}
            />
          </li>
        );
      } else {
        return (
          <li
              key={page.id}
              className={classnames({ highlighted: isActive })}
              onClick={() => { actions.changePage(page.id) }}
          >
            {page.name}
          </li>
        );
      }
    });

    if (pageComponents.length === 0) {
      pageComponents.push(
        <li key="ADD_PAGE" className="suggestion">Please Add a page</li>
      );
    }

    return (
      <div>
        <div
            style={{
              top: this.props.y,
              left: this.props.x
            }}
            className="popup tl fixed w5">
          <div className="ph3">
            <i
                className="fa fa-plus"
                aria-hidden="true"
                onClick={() => { actions.addPage() }}
            />
            <i
                className="fa fa-trash"
                aria-hidden="true"
                onClick={() => { actions.deletePage(currentPageId) }}
            />
            <i
                className="fa fa-pencil-square-o"
                aria-hidden="true"
                onClick={() => {
                    this.setState({
                      isEditing: true,
                      tempText: currentPageName
                    });
                  }}
            />
          </div>
          <ul>
            {pageComponents}
          </ul>
        </div>
        <UpArrow y={this.props.y} x={this.props.x} />
      </div>
    );
  }
});

export default PagesPopup;
