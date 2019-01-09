import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.publish('organizations', function(options) {
  const Organizations = JF.collections.organizations;
  const userId = this.userId;
  const filter = { status: { $gte: 0 }};

  const su = JF.user.isSuperAdmin();
  let orgIds = [];
  if (!su) {
    orgIds = JF.user.getAdminGroupsForUser(userId);
  }

  if (orgIds.length > 0) {
    filter.$or = [];
    orgIds.forEach(_id => filter.$or.push({ _id }));
  }

  if (orgIds.length > 0 || su) {
    return Organizations.find(filter);
  }

  return this.ready();
});
