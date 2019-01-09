import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { _ } from 'meteor/underscore';

JF.user.isSuperAdmin = userId => {
  userId = userId || Meteor.userId();
  return Roles.userIsInRole(userId, 'admin', Roles.GLOBAL_GROUP);
}

JF.user.getAllGroupsForUser = (userId, role) => {
  return Roles.getGroupsForUser(userId, role);
}

JF.user.getGroupsForUserRoles = (userId, roles) => {
  const groups = [];

  roles.forEach(role => {
    groups.push(Roles.getGroupsForUser(userId, role));
  });

  return _.union(...groups);
}

JF.user.getScuGroupsForUser = userId => {
  return JF.user.getGroupsForUserRoles(userId, ['admin', 'js']);
}

JF.user.getScpGroupsForUser = userId => {
  return JF.user.getGroupsForUserRoles(userId, ['admin', 'bg', 'sh']);
}

JF.user.getAdminGroupsForUser = userId => {
  return JF.user.getGroupsForUserRoles(userId, ['admin']);
}
