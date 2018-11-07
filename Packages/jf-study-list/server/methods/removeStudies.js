import { JF } from 'meteor/jf:core';

export default function removeStudies(studyIds, options) {
  if (!studyIds || !studyIds.length) return;

  const Studies = JF.collections.studies;
  studyIds.forEach(studyId => {
    Studies.update({ _id: studyId }, { $set: { removed: true }});
  });
}
