import { JF } from 'meteor/jf:core';

JF.dicomlist.getSelectedDicoms = () => {
  const rowIds = JF.ui.rowSelect.getSelectedRows.call(JF.dicomlist);
  return rowIds.map(rowId => JF.collections.importDicoms.find({ _id: rowId }).fetch()[0]);
}
