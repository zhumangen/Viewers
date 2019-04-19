import { JF } from 'meteor/jf:core';
import { _ } from 'meteor/underscore';

JF.userlist.clearSelections = () => {
  JF.ui.rowSelect.doClearSelections.call(JF.userlist);
};

JF.userlist.getSelectedUserIds = () => {
  return JF.ui.rowSelect.getSelectedRows.call(JF.userlist);
}

JF.userlist.getSelectedUsers = () => {
  const rowIds = JF.userlist.getSelectedUserIds();
  return _.compact(rowIds.map(rowId => Meteor.users.findOne({ _id: rowId })));
};
