import { JF } from 'meteor/jf:core';

JF.userlist.getSelectedUsers = () => {
  const rowIds = JF.ui.rowSelect.getSelectedRows.call(JF.userlist);
  return rowIds.map(rowId => Meteor.users.find({ _id: rowId }).fetch()[0]);
};
