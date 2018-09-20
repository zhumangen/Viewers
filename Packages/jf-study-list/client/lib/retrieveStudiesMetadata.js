import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

const note = 'JF.studylist.retrieveStudiesMetadata is deprecated.';
const instructions = 'Please use JF.studies.retrieveStudiesMetadata instead.';

/**
 * @deprecated Please use JF.studies.retrieveStudiesMetadata instead
 */
JF.studylist.retrieveStudiesMetadata = function() {
    OHIF.log.warn(`${note}\n${instructions}`);
    JF.studies.retrieveStudiesMetadata.apply(this, arguments);
};
