import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { JF } from 'meteor/jf:core';
import { _ } from 'meteor/underscore';

JF.user.hasQualifiedRoles = (type, roles) => {
  const user = Meteor.user();
  const orgIds = JF.user.getAllGroups();
  const filter = {};
  if (!type) {
    filter[`orgTypes.${type}`] = true;
  }
  for (let _id of orgIds) {
    filter._id = _id;
    const org = JF.organization.organizations.findOne(filter);
    if (org && _.intersection(user.roles[org._id], roles).length > 0) {
      return true;
    }
  }

  return false;
}

JF.user.hasAdminRoles = userId => {
  userId = userId || Meteor.userId();
  return Roles.getGroupsForUser(userId, 'admin').length > 0;
}

JF.user.hasScpRoles = () => {
  return JF.user.hasQualifiedRoles('SCP', ['admin', 'bg', 'sh']);
}

JF.user.hasScuRoles = () => {
  return JF.user.hasQualifiedRoles('SCU', ['admin', 'js']);
}

JF.user.hasRoles = (roles, user) => {
  let result = false;

  if (!roles) return result;

  if (!_.isArray(roles)) {
    roles = [roles];
  }

  const allRoles = JF.user.getAllRoles(user);
  return _.intersection(roles, allRoles).length > 0;
}

JF.user.getAllRoles = user => {
  const roles = [];
  user = user || Meteor.user();
  if (user && user.roles) {
    Object.keys(user.roles).forEach(gn => {
      roles = _.union(roles, user.roles[gn]);
    });
  }

  return roles;
}

JF.user.getAllGroups = role => {
  return Roles.getGroupsForUser(Meteor.user(), role);
}

Template.registerHelper('hasRoles', roles => JF.user.hasRoles(roles));
Template.registerHelper('hasAdminRoles', userId => JF.user.hasAdminRoles(userId));
Template.registerHelper('isSuperAdmin', userId => JF.user.isSuperAdmin(userId));
