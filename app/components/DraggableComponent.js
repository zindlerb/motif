import React from 'react';
import _ from 'lodash';
import dragManager from '../dragManager.js';
import classnames from 'classnames';
import $ from 'jquery';

import {Rect, getGlobalPosFromSyntheticEvent, distanceBetweenPoints} from '../utils.js';
import {walkComponentTree} from '../base_components.js';
import stateManager from '../stateManager.js';

function findDropSpot(mousePos, nodeTree) {
    var DIST_RANGE = 50;

    var minDist = DIST_RANGE;
    var closestNode;
    var nodesInMin = [];

    walkComponentTree(nodeTree, function (node, ind) {
        node.getDropPoints().forEach(function(dropPoint) {
            var nodeRect = node.getRect();
            var dist = distanceBetweenPoints(mousePos, dropPoint.point);

            if (dist < DIST_RANGE) {
                nodesInMin.push(dropPoint);
                if (dist < minDist) {
                    minDist = dist;
                    closestNode = dropPoint;
                }
            }
        });
    });

    
    if (closestNode) {
        return {closestNode, nodesInMin};
    } else {
        return;
    }
}

//Takes a component and makes it draggable
var DraggableComponent = React.createClass({
    getInitialState: function () {
        return {isDragging: false};
    },
    makeOnMouseDown: function (Component) {
        var that = this;
        return (e) => {           
            dragManager.start(e, {
                dragType: "addComponent",
                onMove: function (e) {
                    var pos = getGlobalPosFromSyntheticEvent(e);
                    this.dropSpot = findDropSpot(pos, stateManager.state.currentPage.componentTree);

                    stateManager.updateState((state) => {
                        if (this.dropSpot) {
                            state.potentialDropPositions = this.dropSpot.nodesInMin;

                            state.dropHighlightId = this.dropSpot.node.id;
                            state.highlightType = this.dropSpot.dropType;
                        }
                    })
                    
                    that.setState(Object.assign({isDragging: true}, pos));
                },
                onUp: function () {
                    stateManager.updateState((state) => {
                        if (this.dropSpot) {
                            var {dropType, node, ind} = this.dropSpot;
                            if (dropType === "child") {
                                node.addChild(new Component());                            
                            } else if (dropType === "sibling") {
                                node.parent.addChild(new Component(), ind + 1);
                            } else if (dropType === "before") {
                                node.parent.addChild(new Component(), ind);
                            }
                        }

                        state.dropHighlightId = undefined;
                        state.highlightType = undefined;
                    });
                    
                    that.setState({isDragging: false});
                }
            });
        }
        
    },
    render: function() {
        var draggingComponent;
        if (this.state.isDragging) {
            draggingComponent = <div className="absolute" style={{
                left: this.state.x,
                top: this.state.y
            }}>{this.props.children}</div>
        }
        
        return (
            <div>
                <div
                    className={classnames("c-default noselect", {dragged: this.state.dragged})}
                    onMouseDown={this.makeOnMouseDown(this.props.component)}>
                    {this.props.children}
                </div>
                {draggingComponent}
            </div>
        );
    }
});

export default DraggableComponent;
