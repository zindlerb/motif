import React from 'react';

import FormLabel from './forms/FormLabel';
import PopupSelect from './PopupSelect';
import SimplePopupSelectDropdown from './SimplePopupSelectDropdown';

const ComponentsDropdown = function (props) {
  const {
    currentComponentId,
    componentsList,
    currentComponentName,
    actions
  } = props;

  console.log(componentsList);

  return (
    <FormLabel className="mh2" name="Component">
      <PopupSelect
          value={currentComponentName}
          className="f6 pv1">
        <SimplePopupSelectDropdown
            items={componentsList}
            activeValue={currentComponentId}
            onClick={value => actions.setCurrentComponentId(value)}
        />
      </PopupSelect>
    </FormLabel>
  );
}

export default ComponentsDropdown;
