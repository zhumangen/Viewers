import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.publish('organizations', function(options) {
  const Organizations = JF.collections.organizations;
  const userId = this.userId;
  const filter = { removed: false };

  if (JF.user.isSuperAdmin()) {
    return Organizations.find(filter);
  }

  const orgIds = JF.user.getAdminGroupsForUser(userId);
  if (orgIds.length > 0) {
    filter.$or = [];
    orgIds.forEach(_id => filter.$or.push({ _id }));
    return Organizations.find(filter);
  }

  return this.ready();
});
