import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.methods({
  removeStudies(studyIds, options) {
    if (!studyIds || !studyIds.length) return;

    const collection = JF.collections.studies;
    studyIds.forEach(studyId => {
      collection.update({ _id: studyId }, { $set: { removed: true }});
    });
  }
})
