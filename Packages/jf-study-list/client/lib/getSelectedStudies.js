import { JF } from 'meteor/jf:core';
import { _ } from 'meteor/underscore';

JF.studylist.clearSelections = () => {
  JF.ui.rowSelect.doClearSelections.call(JF.studylist);
};

JF.studylist.getSelectedStudyIds = () => {
  return JF.ui.rowSelect.getSelectedRows.call(JF.studylist);
};

JF.studylist.getSelectedStudies = () => {
  const rowIds = JF.studylist.getSelectedStudyIds();
  return _.compact(rowIds.map(rowId => JF.collections.studies.findOne({ _id: rowId })));
};
