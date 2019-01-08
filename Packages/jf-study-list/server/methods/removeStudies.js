import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

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
    const study = Studies.findOne({ _id: studyId });
    if (study) {
      if (Roles.userIsInRole(userId, 'admin', study.organizationId)) {
        const ops = {
          $set: {
            status: -1
          }
        };
        Studies.update({ _id: studyId }, ops, OHIF.MongoUtils.writeCallback);
      } else {
        result.code = 403;
      }
    } else {
      result.code = 404;
    }
  });

  return result;
}
