import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';

function DropPoint(props) {
  var { points, fill } = props;
  var fill = 'pink';
  const width = 40;
  const height = 5;

  if (props.isActive) {
    fill = 'purple';
  }

  return (
    <line
        x1={points[0].x}
        y1={points[0].y}
        x2={points[1].x}
        y2={points[1].y}
        strokeWidth={2}
        stroke={fill}
    />
  );
}

const DropPointRenderer = React.createClass({
  render() {
    if (this.props.dropPoints) {
      const circles = _.map(this.props.dropPoints, function (dropPoint, ind) {
        return <DropPoint key={ind} points={dropPoint.points} isActive={dropPoint.isActive} />;
      });

      return (
        <svg
            className="absolute w-100 h-100 click-through"
            style={{
              left: 0,
              top: 0,
            }}>
          {circles}
        </svg>
      );
    } else {
      return <div style={{ display: 'none' }} />;
    }
  },
});

export default DropPointRenderer;
