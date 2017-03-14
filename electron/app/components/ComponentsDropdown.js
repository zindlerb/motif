import React from 'react';

import FormLabel from './forms/FormLabel';
import PopupSelect from './PopupSelect';
import SimplePopupSelectDropdown from './SimplePopupSelectDropdown';

const ComponentsDropdown = function (props) {
  const {
    currentComponentId,
    componentsList,
    isDefaultComponent,
    currentComponentName,
    actions
  } = props;

  let trash;
  if (!isDefaultComponent) {
    trash = (
      <i
          className="fa fa-trash mh1 clickable"
          aria-hidden="true"
          onClick={() => { actions.deleteCurrentComponentBox() }}
      />
    );
  }

  return (
    <FormLabel className="mh2" name="Component">
      <PopupSelect
          value={currentComponentName}
          inlineAction={trash}
          className="f6 pv1"
      >
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
