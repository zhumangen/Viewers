import { _ } from 'meteor/underscore';
import { JF } from 'meteor/jf:core';

JF.lesiontracker.configureTargetToolsHandles = () => {
    const toggleLabel = (measurementData, eventData, doneCallback) => {
        delete measurementData.isCreating;

        if (JF.lesiontracker.removeMeasurementIfInvalid(measurementData, eventData)) {
            return;
        }

        const getHandlePosition = key => _.pick(measurementData.handles[key], ['x', 'y']);
        const start = getHandlePosition('start');
        const end = getHandlePosition('end');
        const getDirection = axis => start[axis] < end[axis] ? 1 : -1;
        const position = OHIF.cornerstone.pixelToPage(eventData.element, end);

        JF.measurements.toggleLabelButton({
            measurement: measurementData,
            element: eventData.element,
            measurementApi: JF.viewer.measurementApi,
            position: position,
            direction: {
                x: getDirection('x'),
                y: getDirection('y')
            }
        });
    };

    const callbackConfig = {
        // TODO: Check the position for these, the Add Label button position seems very awkward
        getMeasurementLocationCallback: toggleLabel,
        changeMeasurementLocationCallback: toggleLabel,
    };

    // TODO: Reconcile this with the configuration in toolManager  it would be better to have this
    // all in one place.
    const appendConfig = toolType => {
        const tool = cornerstoneTools[toolType];
        const toolConfig = tool.getConfiguration();
        const config = Object.assign({}, toolConfig, callbackConfig);

        tool.setConfiguration(config);
    };

    // Append the callback configuration
    appendConfig('targetRect');
    appendConfig('targetEllipse');
    appendConfig('bidirectional');
    appendConfig('targetProbe');
    appendConfig('targetPencil');
    appendConfig('targetCR');
    appendConfig('targetUN');
};
