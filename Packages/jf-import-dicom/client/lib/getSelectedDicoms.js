import { JF } from 'meteor/jf:core';
import { _ } from 'meteor/underscore';

JF.dicomlist.clearSelections = () => {
  JF.ui.rowSelect.doClearSelections.call(JF.dicomlist);
}

JF.dicomlist.getSelectedDicomIds = () => {
  return JF.ui.rowSelect.getSelectedRows.call(JF.dicomlist);
}

JF.dicomlist.getSelectedDicoms = () => {
  const rowIds = JF.dicomlist.getSelectedDicomIds();
  return _.compact(rowIds.map(rowId => JF.collections.importDicoms.findOne({ _id: rowId })));
}
