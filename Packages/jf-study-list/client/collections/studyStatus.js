import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

// Define the Studies Collection. This is a client-side only Collection which stores the list of
// studies in the StudyList
Meteor.startup(() => {
  const SelectStatus = new Meteor.Collection(null);
  SelectStatus._debugName = 'StudylistSelectStatus';

  JF.studylist.selectStatus = SelectStatus;
});
