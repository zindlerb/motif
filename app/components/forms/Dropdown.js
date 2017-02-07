import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';

const Dropdown = React.createClass({
  /*

     ['text', 'text', 'text']

     or

     [{text: , value: }]
   */
  onChange(e) {
    this.props.onChange(e.target.value, e);
  },
  render() {
    const choices = _.map(this.props.choices, function (choice, ind) {
      let value, text;

      if (_.isString(choice)) {
        value = choice;
        text = choice;
      } else {
        value = choice.value;
        text = choice.text;
      }

      return <option value={value} key={ind}>{text}</option>;
    });

    return (
      <select
          className={classnames(this.props.className)}
          value={this.props.value}
          onChange={this.onChange}>
        {choices}
      </select>
    );
  },
});

export default Dropdown;
