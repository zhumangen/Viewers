import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';
import { Router } from 'meteor/iron:router';

/**
 * Loads multiple unassociated studies in the Viewer
 */
JF.studylist.viewStudies = () => {
    OHIF.log.info('viewStudies');
    const selectedStudies = JF.studylist.getSelectedStudies();

    if (!selectedStudies || !selectedStudies.length) {
        return;
    }

    const studyInstanceUids = selectedStudies.map(study => study.studyInstanceUid).join(';');

    Router.go('viewerStudies', { studyInstanceUids });
};
