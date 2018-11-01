import { JF } from 'meteor/jf:core';

JF.studylist.applySelectedStudies = () => {
  const studies = JF.studylist.getSelectedStudies();
  JF.studylist.applyStudiesProgress(studies);
}
