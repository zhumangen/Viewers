import { JF } from 'meteor/jf:core';

/**
 * Loads multiple unassociated studies in the Viewer
 */
JF.studylist.viewSelectedStudies = () => {
  const studies = JF.studylist.getSelectedStudies();
  JF.studylist.viewStudies(studies);
};
