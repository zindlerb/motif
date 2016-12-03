import React from 'react';
import _ from 'lodash';
import dragManager from '../dragManager.js';
import classnames from 'classnames';
import $ from 'jquery';

import store from '../stateManager.js';
import {getGlobalPosFromSyntheticEvent} from '../utils.js';
import {componentTreeActions} from '../reducersActions/componentTree.js';

import DraggableComponent from './DraggableComponent.js';

function Header(props) {
    var icons = _.map(props.icons, function (icon, ind) {
        var headerClick = function() {
            props.parentCtx.setState({activeSitePanelTab: icon.name});
        }
        
        return (
            <div className={classnames("flex-auto tc pa1 h-100", {
                    highlighted: icon.name === props.activeSitePanelTab,
                })}
                 onClick={headerClick}>
                <i className={classnames("icon", "fa", icon.faClass)} aria-hidden="true"></i> 
            </div>
        );
    });
    return (
        <div className="header justify-around flex w-100">
            {icons}
        </div>
    );
}

var iconList = [
    {name: "PAGES", faClass: "fa-files-o"},
    {name: "STYLE_GUIDE" , faClass: "fa-paint-brush"},
    {name: "COMPONENTS", faClass: "fa-id-card-o"},
    {name: "ASSETS", faClass: "fa-file-image-o"}
];

/* 
 *    dragtype: "addComponent"
 * 
 *    stateManager.updateState((state) => {
 *    if (this.dropSpot) {
 *    var {parent, insertionIndex} = this.dropSpot.closestNode;
 *    console.log("dropped");
 *    
 *    node.parent.addChild(new Component(), ind);
 * }
 * 
 * state.dropHighlightId = undefined;
 * state.highlightType = undefined;
 * });
 * 
 * move:
 *    this.dropSpot = findDropSpot(pos, stateManager.state.currentPage.componentTree);
 * 
 *    stateManager.updateState((state) => {
 *    if (this.dropSpot) {
 *    state.potentialDropPositions = this.dropSpot.nodesInMin;
 *    state.activeDropPosition = this.dropSpot.closestNode;
 *    }
 *    });
 * 
 * */

var ComponentBlock = function(props) {
    var dragData = {
        dragType: "addComponent",
        onMove: function(pos, ctx) {            
            store.dispatch(componentTreeActions.setComponentMoveHighlight(pos));
        },
        onUp: function(pos, ctx) {
            store.dispatch(componentTreeActions.addComponent(props.component));
        }
    };

    
    return (
        <DraggableComponent {...dragData}>
            <li className="m-auto componentBlock pv2 w4 draggableShadow mv2 tc">
                {props.component.name}
            </li>
        </DraggableComponent>
    );
}

var ComponentSidebar = React.createClass({
    getInitialState: function() {
        return {activeSitePanelTab: "COMPONENTS"};
    },
    render: function() {
        var body;

        if (this.state.activeSitePanelTab === "COMPONENTS") {
            var defaultItems = _.map(this.props.components, (component, ind) => {
                return <ComponentBlock component={component}/>
            });

            var userComponents;
            
            body = (
                <div>
                    <h2 className="f4 pt2 pb3 tc">Components</h2>
                    
                    <h3 className="f5 pl3 pv2">Ours</h3>
                    <ul className="list">
                        {defaultItems}
                    </ul>

                    <h3 className="f5 pl3 pv2">Yours</h3>
                    <ul className="list">
                        {userComponents}
                    </ul>
                </div>
            );
        }

        return (
            <div>
                <Header icons={iconList} parentCtx={this} activeSitePanelTab={this.state.activeSitePanelTab} activeIconInd={2}/>
                {body}
            </div>
        );
    }
});

export default ComponentSidebar;
