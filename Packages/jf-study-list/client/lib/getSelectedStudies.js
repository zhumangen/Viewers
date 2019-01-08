import { JF } from 'meteor/jf:core';

JF.studylist.clearSelections = () => {
  JF.ui.rowSelect.doClearSelections.call(JF.studylist);
};

JF.studylist.getSelectedStudyIds = () => {
  return JF.ui.rowSelect.getSelectedRows.call(JF.studylist);
};

JF.studylist.getSelectedStudies = () => {
  const rowIds = JF.studylist.getSelectedStudyIds();
  return rowIds.map(rowId => JF.collections.studies.find({ _id: rowId }).fetch()[0]);
};
