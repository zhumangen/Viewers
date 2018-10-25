import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

// Define the Studies Collection. This is a client-side only Collection which stores the list of
// studies in the StudyList
Meteor.startup(() => {
    const StudyStatus = new Meteor.Collection(null);
    StudyStatus._debugName = 'StudyStatus';

    JF.collections.studyStatus = StudyStatus;
});
