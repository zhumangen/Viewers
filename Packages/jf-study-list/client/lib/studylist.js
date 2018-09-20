import { JF } from 'meteor/jf:core';
import { Router } from 'meteor/iron:router';

// Functions
import { getStudyPriors } from './getStudyPriors';
import { getStudyPriorsMap } from './getStudyPriorsMap';

JF.studylist.functions = {
    getStudyPriors,
    getStudyPriorsMap
};

// Add deprecation notice to the JF.studylist.classes namespace
const note = 'JF.studylist.classes is deprecated.';
const instructions = 'Please use JF.studies.classes instead.';
Object.defineProperty(JF.studylist, 'classes', {
    get() {
        OHIF.log.warn(`${note}\n${instructions}`);
        return JF.studies.classes;
    }
});

const dblClickOnStudy = data => {
    Router.go('viewerStudies', { studyInstanceUids: data.studyInstanceUid });
};

JF.studylist.callbacks.dblClickOnStudy = dblClickOnStudy;
JF.studylist.callbacks.middleClickOnStudy = dblClickOnStudy;
