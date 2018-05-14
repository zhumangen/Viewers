import { JF } from 'meteor/jf:core';
import { cornerstoneTools } from 'meteor/ohif:cornerstone';

JF.measurements.clearCornerstoneToolState = () => {
    cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState({});
};
