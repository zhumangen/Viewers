import { JF } from 'meteor/jf:core';

export default function updateStatus(studyId, status) {
  JF.validation.checks.checkNonEmptyString(studyId);
  JF.validation.checks.checkNonNegativeNumber(status);
  JF.collections.studies.update({ _id: studyId }, { $set: { status }});
}
