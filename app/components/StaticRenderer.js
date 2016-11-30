import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';

var StaticRenderer = React.createClass({
    render: function() {
        return (
            <div className="ma2 h-100 ba debug">
                {this.props.page ? this.props.page.componentTree.render() : ""}
            </div>
        );
    }
});

export default StaticRenderer;
