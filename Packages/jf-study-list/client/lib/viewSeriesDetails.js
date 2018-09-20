import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

/**
 * Display series details of study in a modal
 */
JF.studylist.viewSeriesDetails = () => {
    const selectedStudies = JF.studylist.getSelectedStudies();
    if (!selectedStudies) return;
    OHIF.ui.showDialog('seriesDetailsModal', { selectedStudies });
};
