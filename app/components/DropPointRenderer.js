import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';

function DropPoint(props) {
    var fill = "pink";

    if (props.isActive) {
        fill = "purple";
    }
    
    return <circle cx={props.point.x} cy={props.point.y} r={6} fill={fill}></circle>
}

var DropPointRenderer = React.createClass({
    render: function() {
        if (this.props.dropPoints) {
            var circles = _.map(this.props.dropPoints, function (dropPoint, ind) {
                return <DropPoint key={ind} point={dropPoint.point} isActive={dropPoint.isActive}/>;
            });
            
            return <svg className="absolute w-100 h-100 click-through" style={{
                left: 0,
                top: 0
            }}>{circles}</svg>;
        } else {
            return <div style={{display: "none"}}></div>;
        }
    }
})

export default DropPointRenderer;
