import { JF } from 'meteor/jf:core';

JF.userlist.viewSelectedUser = () => {
  const users = JF.userlist.getSelectedUsers();
  JF.userlist.viewUser(users.length?users[0]:null);
};
