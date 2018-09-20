import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { _ } from 'meteor/underscore';
import { JF } from 'meteor/jf:core';
import { toolManager } from './toolManager';
import { switchToImageRelative } from './switchToImageRelative';
import { switchToImageByIndex } from './switchToImageByIndex';
import { viewportUtils } from './viewportUtils';
import { panelNavigation } from './panelNavigation';

// TODO: add this to namespace definitions
Meteor.startup(function() {
    JF.viewer.loadIndicatorDelay = 200;
    JF.viewer.defaultTool = 'wwwc';
    JF.viewer.refLinesEnabled = true;
    JF.viewer.isPlaying = {};
    JF.viewer.cine = {
        framesPerSecond: 24,
        loop: true
    };

    // For now
    JF.managers.currentHotkeys = JF.managers.defaultHotkeys;

    // Create commands context for viewer
    const contextName = 'viewer';
    JF.managers.commands.createContext(contextName);

    // Create a function that returns true if the active viewport is empty
    const isActiveViewportEmpty = () => {
        const activeViewport = Session.get('activeViewport') || 0;
        return $('.imageViewerViewport').eq(activeViewport).hasClass('empty');
    };

    // Functions to register the tool switching commands
    const registerToolCommands = map => _.each(map, (commandName, toolId) => {
        JF.managers.commands.register(contextName, toolId, {
            name: commandName,
            action: toolManager.setActiveTool,
            params: toolId
        });
    });

    // Register the default tool command
    JF.managers.commands.register(contextName, 'defaultTool', {
        name: 'Default Tool',
        action: () => toolManager.setActiveTool(toolManager.getDefaultTool())
    });

    // Register the tool switching commands
    registerToolCommands({
        wwwc: 'W/L',
        zoom: 'Zoom',
        angle: 'Angle Measurement',
        dragProbe: 'Pixel Probe',
        ellipticalRoi: 'Elliptical ROI',
        rectangleRoi: 'Rectangle ROI',
        magnify: 'Magnify',
        annotate: 'Annotate',
        stackScroll: 'Scroll Stack',
        pan: 'Pan',
        length: 'Length Measurement',
        wwwcRegion: 'W/L by Region',
        crosshairs: 'Crosshairs'
    });

    // Functions to register the viewport commands
    const registerViewportCommands = map => _.each(map, (commandName, commandId) => {
        JF.managers.commands.register(contextName, commandId, {
            name: commandName,
            action: viewportUtils[commandId],
            disabled: isActiveViewportEmpty
        });
    });

    // Register the viewport commands
    registerViewportCommands({
        zoomIn: 'Zoom In',
        zoomOut: 'Zoom Out',
        zoomToFit: 'Zoom to Fit',
        invert: 'Invert',
        flipH: 'Flip Horizontally',
        flipV: 'Flip Vertically',
        rotateR: 'Rotate Right',
        rotateL: 'Rotate Left',
        resetViewport: 'Reset',
        clearTools: 'Clear Tools'
    });

    // Register the preset switching commands
    const applyPreset = presetName => JF.managers.wlPresets.applyWLPresetToActiveElement(presetName);
    for (let i = 0; i < 10; i++) {
        JF.managers.commands.register(contextName, `WLPreset${i}`, {
            name: `W/L Preset ${i + 1}`,
            action: applyPreset,
            params: i
        });
    }

    // Check if display sets can be moved
    const canMoveDisplaySets = isNext => {
        if (!JF.viewerbase.layoutManager) {
            return false;
        } else {
            return JF.viewerbase.layoutManager.canMoveDisplaySets(isNext);
        }
    };

    // Register viewport navigation commands
    JF.managers.commands.set(contextName, {
        scrollDown: {
            name: 'Scroll Down',
            action: () => !isActiveViewportEmpty() && switchToImageRelative(1)
        },
        scrollUp: {
            name: 'Scroll Up',
            action: () => !isActiveViewportEmpty() && switchToImageRelative(-1)
        },
        scrollFirstImage: {
            name: 'Scroll to First Image',
            action: () => !isActiveViewportEmpty() && switchToImageByIndex(0)
        },
        scrollLastImage: {
            name: 'Scroll to Last Image',
            action: () => !isActiveViewportEmpty() && switchToImageByIndex(-1)
        },
        previousDisplaySet: {
            name: 'Previous Series',
            action: () => JF.viewerbase.layoutManager.moveDisplaySets(false),
            disabled: () => !canMoveDisplaySets(false)
        },
        nextDisplaySet: {
            name: 'Next Series',
            action: () => JF.viewerbase.layoutManager.moveDisplaySets(true),
            disabled: () => !canMoveDisplaySets(true)
        },
        nextPanel: {
            name: 'Next Panel',
            action: () => panelNavigation.loadNextActivePanel()
        },
        previousPanel: {
            name: 'Previous Panel',
            action: () => panelNavigation.loadPreviousActivePanel()
        }
    }, true);

    // Register miscellaneous commands
    JF.managers.commands.set(contextName, {
        toggleOverlayTags: {
            name: 'Toggle Image Annotations',
            action() {
                const $dicomTags = $('.imageViewerViewportOverlay .dicomTag');
                $dicomTags.toggle($dicomTags.eq(0).css('display') === 'none');
            }
        },
        toggleCinePlay: {
            name: 'Play/Pause Cine',
            action: viewportUtils.toggleCinePlay,
            disabled: JF.viewerbase.viewportUtils.hasMultipleFrames
        },
        toggleCineDialog: {
            name: 'Show/Hide Cine Controls',
            action: viewportUtils.toggleCineDialog,
            disabled: JF.viewerbase.viewportUtils.hasMultipleFrames
        },
        toggleDownloadDialog: {
            name: 'Show/Hide Download Dialog',
            action: viewportUtils.toggleDownloadDialog,
            disabled: () => !viewportUtils.isDownloadEnabled()
        }
    }, true);

    JF.managers.hotkeys.setStoreFunction(storeHotkeys);
    JF.managers.hotkeys.setRetrieveFunction(retrieveHotKeys);

    // Enable hotkeys
    hotkeyUtils.enableHotkeys();
    JF.managers.hotkeys.load(contextName);
});

function storeHotkeys(contextName, definitions) {
  return JF.managers.settings.setHotkeys(contextName, definitions);
}

function retrieveHotKeys(contextName) {
  return JF.managers.settings.hotkeys(contextName);
}

// Define a jQuery reverse function
$.fn.reverse = [].reverse;

/**
 * Overrides JF's refLinesEnabled
 * @param  {Boolean} refLinesEnabled True to enable and False to disable
 */
function setJFRefLines(refLinesEnabled) {
    JF.viewer.refLinesEnabled = refLinesEnabled;
}

/**
 * Overrides JF's hotkeys
 * @param  {Object} hotkeys Object with hotkeys mapping
 */
function setJFHotkeys(hotkeys) {
    JF.managers.currentHotkeys = hotkeys;
}

/**
 * Binds all hotkeys keydown events to the tasks defined in
 * JF.managers.currentHotkeys or a given param
 * @param  {Object} hotkeys hotkey and task mapping (not required). If not given, uses JF.managers.currentHotkeys
 */
function enableHotkeys(hotkeys) {
    const definitions = hotkeys || JF.managers.currentHotkeys;
    JF.managers.hotkeys.set('viewer', definitions, true);
    JF.managers.contextName.set('viewer');
}

/**
 * Export functions inside hotkeyUtils namespace.
 */

const hotkeyUtils = {
    setJFRefLines, /* @TODO: find a better place for this...  */
    setJFHotkeys,
    enableHotkeys
};

export { hotkeyUtils };
