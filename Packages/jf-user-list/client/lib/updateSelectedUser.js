import { JF } from 'meteor/jf:core';

JF.userlist.updateSelectedUser = () => {
  const users = JF.userlist.getSelectedUsers();
  JF.userlist.updateUser(users.length?users[0]:null);
};
