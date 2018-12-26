import { JF } from 'meteor/jf:core';
import { _ } from 'meteor/underscore';

JF.user.getGroupsForUser = (userId, roles) => {
  const groups = [];

  roles.forEach(role => {
    groups.push(Roles.getGroupsForUser(userId, role));
  });

  return _.union(...groups);
}

JF.user.getScuGroupsForUser = userId => {
  return JF.user.getGroupsForUser(userId, ['admin', 'js']);
}

JF.user.getScpGroupsForUser = userId => {
  return JF.user.getGroupsForUser(userId, ['admin', 'bg', 'sh']);
}

JF.user.getAdminGroupsForUser = userId => {
  return JF.user.getGroupsForUser(userId, ['admin']);
}
