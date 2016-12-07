import React from 'react';
import _ from 'lodash';
import dragManager from '../dragManager.js';
import classnames from 'classnames';
import $ from 'jquery';
import {actionDispatch} from '../stateManager.js';

import Header from './Header.js';
import AttributeField from './AttributeField.js';

var iconList = [
    {name: "ATTRIBUTES", faClass: "fa-table"},
    {name: "DETAILS", faClass: "fa-info-circle"}
];

var RightPanel = React.createClass({
    render: function () {
        var body;
        var {activeComponent} = this.props;
        if (this.props.activePanel === "ATTRIBUTES" && activeComponent) {
            body = [];
            _.forEach(activeComponent.getAllAttrs(), (attrVal, attrKey) => {
                body.push(
                    <AttributeField component={activeComponent} attrKey={attrKey} attrVal={attrVal}/>
                );
            });            
        }
        
        return (
            <div>
                <Header icons={iconList} activePanel={this.props.activePanel} onClick={(name) => {actionDispatch.changePanel(name, "right")}} />
                {body}    
            </div>
        );
    }
});

export default RightPanel;

