import { JF } from 'meteor/jf:core';

export default function queryStudies(studyIds, options) {
  if (!studyIds || !studyIds.length) return;

  const filter = {
    $or: studyIds.map(studyId => { return { _id: studyId }; })
  };
  return JF.collections.studies.find(filter).fetch();
}
