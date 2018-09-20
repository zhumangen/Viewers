import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

/**
 * Exports all selected studies on the studylist
 * @param event Event that triggered the export
 */
JF.studylist.exportSelectedStudies = event => {
    const selectedStudies = JF.studylist.getSelectedStudies();
    const studiesCount = selectedStudies.length;
    const studyText = studiesCount > 1 ? 'Studies' : 'Study';

    OHIF.ui.showDialog('dialogConfirm', {
        element: event.element,
        title: `Export ${studyText}`,
        message: `Would you like to export ${studiesCount} ${studyText.toLowerCase()}?`
    }).then(() => {
        JF.studylist.exportStudies(selectedStudies);
    }).catch(() => {});
};
