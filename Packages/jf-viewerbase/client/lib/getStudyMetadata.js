import { JF } from 'meteor/jf:core';

const getStudyMetadata = study => {
    let studyMetadata = study;
    if (study && !(studyMetadata instanceof JF.viewerbase.metadata.StudyMetadata)) {
        studyMetadata = new JF.metadata.StudyMetadata(study, study.studyInstanceUid);
    }

    return studyMetadata;
};

export { getStudyMetadata };
