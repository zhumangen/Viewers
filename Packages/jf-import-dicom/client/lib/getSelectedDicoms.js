import { JF } from 'meteor/jf:core';

JF.dicomlist.clearSelections = () => {
  JF.ui.rowSelect.doClearSelections.call(JF.dicomlist);
}

JF.dicomlist.getSelectedDicomIds = () => {
  return JF.ui.rowSelect.getSelectedRows.call(JF.dicomlist);
}

JF.dicomlist.getSelectedDicoms = () => {
  const rowIds = JF.dicomlist.getSelectedDicomIds();
  return rowIds.map(rowId => JF.collections.importDicoms.find({ _id: rowId }).fetch()[0]);
}
