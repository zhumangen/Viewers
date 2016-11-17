Meteor.startup(function() {
    toolManager.addTool('bidirectional', {
        mouse: cornerstoneTools.bidirectional,
        touch: cornerstoneTools.bidirectionalTouch
    });

    toolManager.addTool('nonTarget', {
        mouse: cornerstoneTools.nonTarget,
        touch: cornerstoneTools.nonTargetTouch
    });

    toolManager.addTool('scaleOverlayTool', {
        mouse: cornerstoneTools.scaleOverlayTool,
        touch: cornerstoneTools.scaleOverlayTool
    });

    toolManager.addTool('deleteLesionKeyboardTool', {
        mouse: cornerstoneTools.deleteLesionKeyboardTool,
        touch: cornerstoneTools.deleteLesionKeyboardTool
    });

    toolManager.addTool('crTool', {
        mouse: cornerstoneTools.crTool,
        touch: cornerstoneTools.crToolTouch
    });

    toolManager.addTool('unTool', {
        mouse: cornerstoneTools.unTool,
        touch: cornerstoneTools.unToolTouch
    });

    toolManager.addTool('exTool', {
        mouse: cornerstoneTools.exTool,
        touch: cornerstoneTools.exToolTouch
    });

    // Update default state for tools making sure each tool is only inserted once
    let currentDefaultStates = toolManager.getToolDefaultStates();
    let newDefaultStates = {
        deactivate: new Set(['bidirectional', 'nonTarget', 'length', 'crTool', 'unTool', 'exTool']),
        activate: new Set(['deleteLesionKeyboardTool'])
    };

    for (let state in newDefaultStates) {
        let newTools = newDefaultStates[state];
        let tools = currentDefaultStates[state];
        currentDefaultStates[state] = tools.union(newTools);
    }

    toolManager.setToolDefaultStates(currentDefaultStates);

});