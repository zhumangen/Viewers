import { JF } from 'meteor/jf:core';

JF.studylist.getSelectedStudies = () => {
  const rowIds = JF.ui.rowSelect.getSelectedRows.call(JF.studylist);
  return rowIds.map(rowId => JF.collections.studies.find({ _id: rowId }).fetch()[0]);
};
