import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.publish('users', function(options) {
  const userId = this.userId;
  const filter = {};
  const fields = { fields: { services: 0, previousPasswords: 0 }};

  if (JF.user.isSuperAdmin()) {
    return Meteor.users.find(filter, fields);
  }

  const orgIds = JF.user.getAdminGroupsForUser(userId);
  if (orgIds.length > 0) {
    filter.$or = [];
    orgIds.forEach(orgId => {
      const obj = {};
      obj[`roles.${orgId}`] =  { $exists: true };
      filter.$or.push(obj);
    });
    return Meteor.users.find(filter, fields);
  }

  return this.ready();
});
