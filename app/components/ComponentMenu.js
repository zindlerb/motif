import React from 'react';
import _ from 'lodash';
import fuzzy from 'fuzzy';

import { actionDispatch } from '../stateManager';

function fuzzyFilterList(stringList, testString) {
  let results = fuzzy.filter(testString, stringList);
  let matches = results.map(function (el) { return el.string; });

  return matches;
}

const ROOT = 'ROOT';
const INSERTION = 'INSERTION';
const WRAP = 'WRAP';

const ComponentMenu = React.createClass({
  getInitialState() {
    return {
      searchString: '',
      menuState: ROOT
    };
  },

  componentWillReceiveProps(nextProps) {
    if (!nextProps.menu.isOpen && this.state.menuState !== ROOT) {
      this.setState({
        searchString: '',
        menuState: ROOT
      });
    }
  },

  render() {
    let { componentMapByName, menu } = this.props;
    let { component, isOpen, componentX, componentY } = menu;
    let { menuState, searchString } = this.state;
    let menuComponent = component;
    let listItems;
    let sx = { position: 'absolute' };

    if (isOpen) {
      sx.left = componentX;
      sx.top = componentY;

      if (menuState === ROOT) {
        listItems = [
          (<li
               key={INSERTION}
               onMouseUp={(e) => {
                 this.setState({ menuState: INSERTION });
                 e.stopPropagation();
               }}
          >
  Insert
          </li>),

          (<li
               key={WRAP}
               onMouseUp={(e) => {
                 this.setState({ menuState: WRAP });
                 e.stopPropagation();
               }}
          >
            Wrap
          </li>),

          (<li
               key={'DELETE'}
               onMouseUp={(e) => {
                 actionDispatch.deleteComponent(menuComponent);
                 actionDispatch.closeMenu();
                 e.stopPropagation();
               }}
          >
            Delete
          </li>),

          (<li
               key={'MAKE_COMPONENT'}
               onMouseUp={(e) => {
                 actionDispatch.createComponentBlock(menuComponent);
                 actionDispatch.closeMenu();
                 e.stopPropagation();
               }}
          >
            Make Component
          </li>)
        ];
      } else if (menuState === INSERTION || menuState === WRAP) {
        let makeComponentOnClick;
        let componentList = _.keys(componentMapByName);

        if (menuState === INSERTION) {
          makeComponentOnClick = component => () => {
            actionDispatch.addComponent(component, menu.component, 0);
          };
        } else if (menuState === WRAP) {
          makeComponentOnClick = component => () => {
            actionDispatch.wrapComponent(component, menu.component);
          };
        }

        listItems = [
          (<li
               key={'ROOT'}
               onMouseUp={(e) => {
                 this.setState({ menuState: ROOT });
                 e.stopPropagation();
               }}
          >Back</li>),
          (<li key={'SEARCH'} onMouseUp={(e) => { e.stopPropagation(); }}>
            <input
                type="text"
                value={searchString}
                onChange={(e) => {
                  this.setState({ searchString: e.target.value });
                  e.stopPropagation();
                }}
            />
          </li>),

        ];

        if (searchString) {
          componentList = fuzzyFilterList(componentList, searchString);
        }

        componentList = componentList.map(function (componentName) {
          return (<li
key={componentName} onMouseUp={makeComponentOnClick(componentMapByName[componentName])}
          >
            {componentName}
          </li>);
        });

        listItems = listItems.concat(componentList);
      }

      return (
        <ul style={sx} className="component-menu">
          {listItems}
        </ul>
      );
    } else {
      return <div />;
    }
  }
});

export default ComponentMenu;
