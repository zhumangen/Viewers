import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { JF } from 'meteor/jf:core';
import { _ } from 'meteor/underscore';

JF.user.hasQualifiedRoles = (type, roles) => {
  const user = Meteor.user();
  const orgIds = JF.user.getAllGroups();
  for (let _id of orgIds) {
    const org = JF.organization.organizations.findOne({ _id, type });
    if (org && _.intersection(user.roles[org._id], roles).length > 0) {
      return true;
    }
  }

  return false;
}

JF.user.hasAdminRoles = () => {
  return Roles.getGroupsForUser(Meteor.user(), 'admin').length > 0;
}

JF.user.hasScpRoles = () => {
  return JF.user.hasQualifiedRoles('SCP', ['admin', 'bg', 'sh']);
}

JF.user.hasScuRoles = () => {
  return JF.user.hasQualifiedRoles('SCU', ['admin', 'js']);
}

JF.user.hasRoles = roles => {
  let result = false;

  if (!roles) return result;

  if (!_.isArray(roles)) {
    roles = [roles];
  }

  result = true;
  const allRoles = JF.user.getAllRoles();
  roles.forEach(role => {
    if (allRoles.indexOf(role) < 0) {
      result = false;
    }
  });

  return result;
}

JF.user.getAllRoles = () => {
  const roles = [];
  const user = Meteor.user();
  if (user && user.roles) {
    Object.keys(user.roles).forEach(gn => {
      roles.push(user.roles[gn]);
    });
  }

  return roles;
}

JF.user.getAllGroups = role => {
  return Roles.getGroupsForUser(Meteor.user(), role);
}

Template.registerHelper('hasRoles', roles => JF.user.hasRoles(roles));
