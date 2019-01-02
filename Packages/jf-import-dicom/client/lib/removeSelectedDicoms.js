import { JF } from 'meteor/jf:core';

JF.dicomlist.removeSelectedDicoms = () => {
  const rowIds = JF.dicomlist.getSelectedDicomIds();
  if (rowIds.length > 0) {
    const filter = { $or: [] };
    rowIds.forEach(_id => filter.$or.push({ _id }));
    JF.collections.importDicoms.remove(filter);
  }
}
