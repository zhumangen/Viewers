import { JF } from 'meteor/jf:core';

/**
 * Extensible method to trigger unsaved changes on the active timepoint
 *
 * @param {String} subpath - The unsaved changes subpath that will come after the timepoint ID
 */
JF.measurements.triggerTimepointUnsavedChanges = (subpath='changed') => {
    const basePath = 'viewer.studyViewer.measurements';
    OHIF.ui.unsavedChanges.set(`${basePath}.${subpath}`);
};
