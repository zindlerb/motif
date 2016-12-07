import _ from 'lodash';
import classnames from 'classnames';
import React from 'react';


export default function Header(props) {
    var icons = _.map(props.icons, function (icon, ind) {
        var headerClick = function() {
            props.onClick(icon.name);            
        }
        
        return (
            <div className={classnames("flex-auto tc pa1 h-100", {
                    highlighted: icon.name === props.activePanel,
                })}
                 onClick={headerClick}
                 key={ind}
            >
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



