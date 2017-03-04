import React from 'react';
import { connect } from 'react-redux';

import { ComponentsContainer } from '../base_components';
import { createImmutableJSSelector } from '../utils';
import { componentTreeMetadataSelector } from '../selectors';
import StaticRenderer from '../components/StaticRenderer';
import ViewChoiceDropdown from '../components/ViewChoiceDropdown';
import FormLabel from '../components/forms/FormLabel';
import SimplePopupSelectDropdown from '../components/SimplePopupSelectDropdown';
import PopupSelect from '../components/PopupSelect.js';

const ComponentsDropdown = React.createClass({
  render() {
    const {
      currentComponentId,
      componentsList,
      actions
    } = this.props;

    return (
      <FormLabel className="mh2" name="Component">
        <PopupSelect
            value={currentComponentId}
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
});

const ComponentViewRenderer = React.createClass({
  render() {
    const {
      renderTree,
      componentsList,
      currentMainView,
      currentComponentId,
      hoveredComponentId,
      activeComponentId,
      rendererWidth,
      actions
    } = this.props;
    //TD: Add props to components dropdown
    return (
      <div className="flex-auto flex flex-column h-100 mh4 relative mv4">
        <ViewChoiceDropdown
            mainView={currentMainView}
            actions={actions}
        />
        <ComponentsDropdown
            componentsList={componentsList}
            currentComponentId={currentComponentId}
            actions={actions}
        />
        <StaticRenderer
            actions={actions}
            renderTree={renderTree}
            hoveredComponentId={hoveredComponentId}
            activeComponentId={activeComponentId}
            setRendererWidth={actions.setComponentsViewWidth}
            width={rendererWidth}
        />
      </div>
    );
  }
});

const componentsListSelector = createImmutableJSSelector(
  [
    state => state.get('ourComponentBoxes'),
    state => state.get('yourComponentBoxes'),
    state => state.get('componentsMap')
  ],
  (ourComponentBoxes, yourComponentBoxes, componentsMap) => {
    const componentsList = [];

    [ourComponentBoxes, yourComponentBoxes].forEach((componentBoxes) => {
      componentBoxes.forEach((componentId) => {
        componentsList.push({
          text: ComponentsContainer.getName(componentsMap, componentId),
          value: componentId
        });
      });
    });

    return componentsList;
  }
)

const componentViewRendererSelector = createImmutableJSSelector(
  [
    componentsListSelector,
    componentTreeMetadataSelector,
    state => state.get('componentsView'),
    state => state.get('componentsMap'),
    state => state.get('currentMainView')
  ],
  (componentsList, componentTreeMetadata, componentsView, componentsMap, currentMainView) => {
    return Object.assign({
      componentsList,
      rendererWidth: componentsView.get('rendererWidth'),
      currentComponentId: componentsView.get('currentComponentId'),
      renderTree: ComponentsContainer.getRenderTree(
        componentsMap,
        componentsView.get('currentComponentId')
      ),
      currentMainView
    }, componentTreeMetadata);
  }
);

export default connect(componentViewRendererSelector)(ComponentViewRenderer);
