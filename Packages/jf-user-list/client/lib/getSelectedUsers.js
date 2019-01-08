import { JF } from 'meteor/jf:core';

JF.userlist.clearSelections = () => {
  JF.ui.rowSelect.doClearSelections.call(JF.userlist);
};

JF.userlist.getSelectedUserIds = () => {
  return JF.ui.rowSelect.getSelectedRows.call(JF.userlist);
}

JF.userlist.getSelectedUsers = () => {
  const rowIds = JF.userlist.getSelectedUserIds();
  return rowIds.map(rowId => Meteor.users.find({ _id: rowId }).fetch()[0]);
};
