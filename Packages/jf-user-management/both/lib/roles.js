import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

JF.user.isSuperAdmin = () => {
  return Roles.userIsInRole(Meteor.user(), 'admin', Roles.GLOBAL_GROUP);
}

JF.user.getAllGroupsForUser = (userId, role) => {
  return Roles.getGroupsForUser(userId, role);
}
