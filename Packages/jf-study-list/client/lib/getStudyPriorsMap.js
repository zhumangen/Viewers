import { JF } from 'meteor/jf:core';
import 'meteor/jf:viewerbase';
// Local Dependencies
import { getStudyPriors } from './getStudyPriors';

const { StudyMetadata, StudySummary } = JF.viewerbase.metadata;

/**
 * Create a Map of study priors where the key of each entry is the StudyInstanceUID and its value is an array of StudySummary instances.
 * @returns {Map} The study map.
 */
const getStudyPriorsMap = studies => {

    const priorsMap = new Map();

    if (studies instanceof Array) {
        studies.forEach(study => {
            if (study instanceof StudyMetadata || study instanceof StudySummary) {
                const studyObjectID = study.getObjectID();
                if (studyObjectID) {
                    const priors = getStudyPriors(study);
                    priorsMap.set(studyObjectID, priors);
                }
            }
        });
    }

    return priorsMap;

};

export { getStudyPriorsMap };
