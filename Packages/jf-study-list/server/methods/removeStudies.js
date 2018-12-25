import { JF } from 'meteor/jf:core';

export default function removeStudies(studyIds, options) {
  const result = { code: 200 };
  const userId = this.userId;

  if (!studyIds || !studyIds.length) {
    result.code = 400;
    return result;
  }

  if (!userId) {
    result.code = 401;
    return result;
  }

  const Studies = JF.collections.studies;
  studyIds.forEach(studyId => {
    const ops = {
      $set: {
        removed: true,
        removedAt: new Date(),
        removedBy: userId
      }
    };
    Studies.update({ _id: studyId }, ops);
  });

  return result;
}
