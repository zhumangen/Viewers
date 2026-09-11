import React, { useEffect, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

import { HangingProtocolService, CommandsManager } from '@ohif/core';
import { useAppConfig } from '@state';
import ViewerHeader from './ViewerHeader';
import ZelvynToolRail from './ZelvynToolRail';
import ZelvynSeriesPanel from './ZelvynSeriesPanel';
import ZelvynStatusBar from './ZelvynStatusBar';
import SidePanelWithServices from '../Components/SidePanelWithServices';
import { Onboarding, ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@ohif/ui-next';
import useResizablePanels from './ResizablePanelsHook';

const resizableHandleClassName = 'mt-px bg-border';
const HEADER_H = 44; // ZelvynViewerChrome h-11
const STATUS_H = 28; // ZelvynStatusBar h-7

function ViewerLayout({
  extensionManager,
  servicesManager,
  hotkeysManager,
  commandsManager,
  viewports,
  ViewportGridComp,
  leftPanelClosed = false,
  rightPanelClosed = false,
  leftPanelResizable = false,
  rightPanelResizable = false,
  leftPanelInitialExpandedWidth,
  rightPanelInitialExpandedWidth,
  leftPanelMinimumExpandedWidth,
  rightPanelMinimumExpandedWidth,
}: withAppTypes): React.FunctionComponent {
  const [appConfig] = useAppConfig();

  const { panelService, hangingProtocolService, customizationService, viewportGridService } =
    servicesManager.services;
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(appConfig.showLoadingIndicator);
  const appliedDefaultGrid = useRef(false);

  const hasPanels = useCallback(
    (side): boolean => !!panelService.getPanels(side).length,
    [panelService]
  );

  const [hasRightPanels, setHasRightPanels] = useState(hasPanels('right'));
  const [hasLeftPanels, setHasLeftPanels] = useState(hasPanels('left'));
  const [leftPanelClosedState, setLeftPanelClosed] = useState(leftPanelClosed);
  const [rightPanelClosedState, setRightPanelClosed] = useState(rightPanelClosed);

  const [
    leftPanelProps,
    rightPanelProps,
    resizablePanelGroupProps,
    resizableLeftPanelProps,
    resizableViewportGridPanelProps,
    resizableRightPanelProps,
    onHandleDragging,
  ] = useResizablePanels(
    leftPanelClosed,
    setLeftPanelClosed,
    rightPanelClosed,
    setRightPanelClosed,
    hasLeftPanels,
    hasRightPanels,
    leftPanelInitialExpandedWidth,
    rightPanelInitialExpandedWidth,
    leftPanelMinimumExpandedWidth,
    rightPanelMinimumExpandedWidth
  );

  const handleMouseEnter = () => {
    (document.activeElement as HTMLElement)?.blur();
  };

  const LoadingIndicatorProgress = customizationService.getCustomization(
    'ui.loadingIndicatorProgress'
  );

  useEffect(() => {
    document.body.classList.add('bg-background');
    document.body.classList.add('overflow-hidden');

    return () => {
      document.body.classList.remove('bg-background');
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  const getComponent = id => {
    const entry = extensionManager.getModuleEntry(id);

    if (!entry || !entry.component) {
      throw new Error(
        `${id} is not valid for an extension module or no component found from extension ${id}. Please verify your configuration or ensure that the extension is properly registered. It's also possible that your mode is utilizing a module from an extension that hasn't been included in its dependencies (add the extension to the "extensionDependencies" array in your mode's index.js file). Check the reference string to the extension in your Mode configuration`
      );
    }

    return { entry };
  };

  useEffect(() => {
    const { unsubscribe } = hangingProtocolService.subscribe(
      HangingProtocolService.EVENTS.PROTOCOL_CHANGED,
      () => {
        setShowLoadingIndicator(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [hangingProtocolService]);

  // Default to 2x2 viewport grid once viewports are ready (design mockup).
  useEffect(() => {
    if (!viewportGridService) {
      return;
    }
    const apply = () => {
      if (appliedDefaultGrid.current) {
        return;
      }
      const state = viewportGridService.getState?.();
      const layout = state?.layout;
      // Only promote 1x1 → 2x2 so user/HP multi-viewport choices are respected.
      if (layout && layout.numRows === 1 && layout.numCols === 1) {
        appliedDefaultGrid.current = true;
        commandsManager.run('setViewportGridLayout', { numRows: 2, numCols: 2 });
      } else if (layout && (layout.numRows > 1 || layout.numCols > 1)) {
        appliedDefaultGrid.current = true;
      }
    };

    const subs = [
      viewportGridService.subscribe(viewportGridService.EVENTS.VIEWPORTS_READY, apply),
      viewportGridService.subscribe(viewportGridService.EVENTS.LAYOUT_CHANGED, () => {
        // mark applied if user already changed layout
        const state = viewportGridService.getState?.();
        const layout = state?.layout;
        if (layout && (layout.numRows !== 1 || layout.numCols !== 1)) {
          appliedDefaultGrid.current = true;
        }
      }),
    ];
    // Attempt once in case VIEWPORTS_READY already fired.
    apply();
    return () => subs.forEach(s => s.unsubscribe());
  }, [viewportGridService, commandsManager]);

  const getViewportComponentData = viewportComponent => {
    const { entry } = getComponent(viewportComponent.namespace);

    return {
      component: entry.component,
      isReferenceViewable: entry.isReferenceViewable,
      displaySetsToDisplay: viewportComponent.displaySetsToDisplay,
    };
  };

  useEffect(() => {
    const { unsubscribe } = panelService.subscribe(
      panelService.EVENTS.PANELS_CHANGED,
      ({ options }) => {
        setHasLeftPanels(hasPanels('left'));
        setHasRightPanels(hasPanels('right'));
        if (options?.leftPanelClosed !== undefined) {
          setLeftPanelClosed(options.leftPanelClosed);
        }
        if (options?.rightPanelClosed !== undefined) {
          setRightPanelClosed(options.rightPanelClosed);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [panelService, hasPanels]);

  const viewportComponents = viewports.map(getViewportComponentData);

  return (
    <div
      className="zelvyn-shell flex h-screen flex-col overflow-hidden"
      data-shell="zelvyn-viewer"
    >
      <ViewerHeader
        hotkeysManager={hotkeysManager}
        extensionManager={extensionManager}
        servicesManager={servicesManager}
        appConfig={appConfig}
      />
      <div
        className="relative flex w-full flex-1 flex-row flex-nowrap items-stretch overflow-hidden bg-[color:var(--bg-canvas,#0B0F14)]"
        style={{ height: `calc(100vh - ${HEADER_H}px - ${STATUS_H}px)` }}
      >
        <ZelvynToolRail />

        <React.Fragment>
          {showLoadingIndicator && (
            <LoadingIndicatorProgress className="h-full w-full bg-background" />
          )}
          <ResizablePanelGroup {...resizablePanelGroupProps}>
            {hasLeftPanels ? (
              <>
                <ResizablePanel {...resizableLeftPanelProps}>
                  <SidePanelWithServices
                    side="left"
                    isExpanded={!leftPanelClosedState}
                    servicesManager={servicesManager}
                    {...leftPanelProps}
                  />
                </ResizablePanel>
                <ResizableHandle
                  onDragging={onHandleDragging}
                  disabled={!leftPanelResizable}
                  className={resizableHandleClassName}
                />
              </>
            ) : null}
            <ResizablePanel {...resizableViewportGridPanelProps}>
              <div className="relative flex h-full flex-1 flex-col">
                <div
                  className="zelvyn-viewport-frame relative m-0.5 flex h-full flex-1 items-center justify-center overflow-hidden rounded-sm border border-[color:var(--border-subtle,#1E2A36)] bg-[color:var(--viewport-chrome,#0A0E12)]"
                  onMouseEnter={handleMouseEnter}
                  data-chrome="zelvyn-viewport-frame"
                >
                  <ViewportGridComp
                    servicesManager={servicesManager}
                    viewportComponents={viewportComponents}
                    commandsManager={commandsManager}
                  />
                </div>
              </div>
            </ResizablePanel>
            {hasRightPanels ? (
              <>
                <ResizableHandle
                  onDragging={onHandleDragging}
                  disabled={!rightPanelResizable}
                  className={resizableHandleClassName}
                />
                <ResizablePanel {...resizableRightPanelProps}>
                  {/* Series-only chrome — no SidePanel tab strip (mockup) */}
                  <div
                    className="h-full w-full overflow-hidden border-l border-[color:var(--border-subtle,#1E2A36)]"
                    data-chrome="zelvyn-series-host"
                  >
                    <ZelvynSeriesPanel />
                  </div>
                </ResizablePanel>
              </>
            ) : null}
          </ResizablePanelGroup>
        </React.Fragment>
      </div>
      <ZelvynStatusBar />
      <Onboarding tours={customizationService.getCustomization('ohif.tours')} />
    </div>
  );
}

ViewerLayout.propTypes = {
  extensionManager: PropTypes.shape({
    getModuleEntry: PropTypes.func.isRequired,
  }).isRequired,
  commandsManager: PropTypes.instanceOf(CommandsManager),
  servicesManager: PropTypes.object.isRequired,
  leftPanels: PropTypes.array,
  rightPanels: PropTypes.array,
  leftPanelClosed: PropTypes.bool.isRequired,
  rightPanelClosed: PropTypes.bool.isRequired,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  viewports: PropTypes.array,
};

export default ViewerLayout;
