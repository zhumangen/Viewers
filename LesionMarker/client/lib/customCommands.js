import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { OHIF } from 'meteor/ohif:core';

Meteor.startup(() => {
    const { toolManager } = JF.viewerbase;
    const contextName = 'viewer';

    // Enable the custom tools
    const customTools = [{
        id: 'bidirectional',
        name: 'Target'
    }, {
        id: 'nonTarget',
        name: 'Non-Target'
    }, {
        id: 'targetRect',
        name: 'Rectangle Target'
    }, {
        id: 'targetEllipse',
        name: 'Ellipse Target'
    }, {
        id: 'targetProbe',
        name: 'Probe Target'
    }, {
        id: 'targetPencil',
        name: 'Pencil Target'
    }, {
        id: 'targetCR',
        name: 'CR Target'
    }, {
        id: 'targetUN',
        name: 'UN Target'
    }];
    customTools.forEach(tool => {
        _.defaults(JF.managers.hotkeys.defaults[contextName], { [tool.id]: '' });
        JF.managers.commands.register(contextName, tool.id, {
            name: tool.name,
            action: tool.action || (() => toolManager.setActiveTool(tool.id))
        });
    });

    // Enable the custom commands
    const customCommands = [{
        id: 'linkStackScroll',
        name: 'Link',
        action: JF.viewerbase.viewportUtils.linkStackScroll
    }, {
        id: 'saveMeasurements',
        name: 'Save measurements',
        hotkey: 'CTRL+S',
        action() {
            const activeTimepoint = JF.measurements.getActiveTimepoint();
            if (!activeTimepoint) return;
            JF.measurements.saveMeasurements(JF.viewer.measurementApi, activeTimepoint.timepointId);
        }
    }];
    customCommands.forEach(command => {
        _.defaults(JF.managers.hotkeys.defaults[contextName], { [command.id]: command.hotkey || '' });
        JF.managers.commands.register(contextName, command.id, {
            name: command.name,
            action: command.action || (() => toolManager.setActiveTool(command.id))
        });
    });
});
