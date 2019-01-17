import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.publish('studies', function(options) {
  const Studies = JF.collections.studies;
  const userId = this.userId;
  const filter = { status: { $gte: 0 }};

  if (options.filter) {
    Object.assign(filter, options.filter);
  }

  if (JF.user.isSuperAdmin()) {
    return Studies.find(filter);
  }

  const orgIds = JF.user.getScuGroupsForUser(userId);
  if (orgIds.length > 0) {
    filter.$or = [];
    orgIds.forEach(orgId => filter.$or.push({ organizationId: orgId }));
    return Studies.find(filter);
  }

  return this.ready();
});
