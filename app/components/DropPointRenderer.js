import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';

function DropPoint(props) {
  var { point, fill } = props;
  var fill = "pink";
  var width = 40;
  var height = 5;

  if (props.isActive) {
    fill = "purple";
  }

  return (
    <rect
        x={point.x - width/2}
        y={point.y - height/2}
        width={width}
        height={height}
        fill={fill}
    >
    </rect>
  )
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
