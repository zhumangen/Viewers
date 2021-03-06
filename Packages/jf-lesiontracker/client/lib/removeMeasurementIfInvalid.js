import { JF } from 'meteor/jf:core';
import { _ } from 'meteor/underscore';

JF.lesiontracker.removeMeasurementIfInvalid = (measurementData, eventData) => {
    const handles = measurementData.handles;
    const start = _.pick(handles.start, ['x', 'y']);
    const end = _.pick(handles.end, ['x', 'y']);
    const element = eventData.element;
    const toolType = measurementData.toolType;
    if (_.isEqual(start, end)) {
        cornerstoneTools.removeToolState(element, toolType, measurementData);
        return true;
    }

    return false;
};
