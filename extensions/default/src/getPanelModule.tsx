import React from 'react';
import { WrappedPanelStudyBrowser } from './Panels';
import { ZelvynSeriesPanel } from './ViewerLayout/ZelvynSeriesPanel';

function getPanelModule({ commandsManager, extensionManager, servicesManager }) {
  return [
    {
      name: 'seriesList',
      iconName: 'tab-studies',
      iconLabel: 'Series',
      label: 'Series',
      component: props => (
        <WrappedPanelStudyBrowser
          {...props}
          commandsManager={commandsManager}
          extensionManager={extensionManager}
          servicesManager={servicesManager}
        />
      ),
    },
    {
      name: 'zelvynSeries',
      iconName: 'tab-studies',
      iconLabel: 'Series',
      label: 'Series',
      component: () => <ZelvynSeriesPanel />,
    },
  ];
}

export default getPanelModule;
