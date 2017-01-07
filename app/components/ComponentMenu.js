import React from 'react';
import _ from 'lodash';
import { actionDispatch, } from '../stateManager.js';
import fuzzy from 'fuzzy';

function fuzzyFilterList(stringList, testString) {
  var results = fuzzy.filter(testString, stringList);
  var matches = results.map(function(el) { return el.string; });

  return matches;
}

const ROOT = 'ROOT';
const INSERTION = 'INSERTION';
const WRAP = 'WRAP';

const ComponentMenu = React.createClass({
  getInitialState: function () {
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

  render: function() {
    let { componentMapByName, menu } = this.props;
    let { menuComponent, isOpen, componentX, componentY } = menu;
    let { menuState, searchString } = this.state;
    let listItems;
    let sx = { position: 'absolute' };

    if (isOpen) {
      sx.left = componentX;
      sx.top = componentY;

      if (menuState === ROOT) {
        listItems = [
          (<li onClick={(e) => {
              this.setState({menuState: INSERTION})
              e.stopPropagation();
            }}>
  Insert
          </li>),

          (<li onClick={(e) => {
              this.setState({menuState: WRAP})
              e.stopPropagation();
            }}>
            Wrap
          </li>),

          (<li onClick={(e) => {
              actionDispatch.deleteComponent(menuComponent);
              actionDispatch.closeMenu();
              e.stopPropagation();
            }}>
            Delete
          </li>),

          (<li onClick={(e) => {
              actionDispatch.createComponentBlock(menuComponent);
              actionDispatch.closeMenu();
              e.stopPropagation();
            }}>
            Make Component
          </li>)
        ]
      } else if (menuState === INSERTION || menuState === WRAP) {
        let makeComponentOnClick;
        let componentList = _.keys(componentMapByName);

        if (menuState === INSERTION) {
          makeComponentOnClick = (component) => {
            return (e) => {
              actionDispatch.insertComponent(component);
            }
          }
        } else if (menuState === WRAP) {
          makeComponentOnClick = (component) => {
            return (e) => {
              actionDispatch.wrapComponent(component);
            }
          }
        }

        listItems = [
          (<li onClick={(e) => {
              this.setState({menuState: ROOT});
              e.stopPropagation();
            }}>Back</li>),
          (<li onClick={(e) => { e.stopPropagation(); }}>
            <input
                type="text"
                value={searchString}
                onChange={(e) => {
                    this.setState({searchString: e.target.value});
                    e.stopPropagation();
                  }}
            />
          </li>),
        ]

        if (searchString) {
          componentList = fuzzyFilterList(componentList, searchString);
        }

        componentList = componentList.map(function(componentName) {
          return (<li onClick={makeComponentOnClick(componentMapByName[componentName])}>
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
      return <div/>;
    }
  }
});

export default ComponentMenu;
