import { JF } from 'meteor/jf:core';

const note = 'JF.studylist.retrieveStudyMetadata is deprecated.';
const instructions = 'Please use JF.studies.retrieveStudyMetadata instead.';

/**
 * @deprecated Please use JF.studies.retrieveStudyMetadata instead
 */
JF.studylist.retrieveStudyMetadata = function() {
    OHIF.log.warn(`${note}\n${instructions}`);
    JF.studies.retrieveStudyMetadata.apply(this, arguments);
};
