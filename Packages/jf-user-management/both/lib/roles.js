import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

JF.user.isSuperAdmin = userId => {
  userId = userId || Meteor.userId();
  return Roles.userIsInRole(userId, 'admin', Roles.GLOBAL_GROUP);
}

JF.user.getAllGroupsForUser = (userId, role) => {
  return Roles.getGroupsForUser(userId, role);
}
