import React from 'react';
import _ from 'lodash';

function DropPoint(props) {
  let { points } = props;
  let fill = 'pink';

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
    let { dropPoints, activeDropPoint } = this.props;
    if (dropPoints || activeDropPoint) {
      const circles = _.map(dropPoints, function (dropPoint, ind) {
        return <DropPoint key={ind} points={dropPoint.points} isActive={false} />;
      });

      if (activeDropPoint) {
        circles.push(<DropPoint key={'ACTIVE'} points={activeDropPoint.points} isActive />);
      }

      return (
        <svg
            className="absolute w-100 h-100 click-through"
            style={{
              left: 0,
              top: 0,
            }}
        >
          {circles}
        </svg>
      );
    } else {
      return <div style={{ display: 'none' }} />;
    }
  },
});

export default DropPointRenderer;
