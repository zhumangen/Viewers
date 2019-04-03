import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.publish('studiesCount', function() {
  return JF.collections.studiesCount.find({ userId: this.userId });
});

Meteor.publish('studies', function(options) {
  const Studies = JF.collections.studies;
  const StudiesCount = JF.collections.studiesCount;
  const userId = this.userId;
  const su = JF.user.isSuperAdmin();
  const filter = { status: { $gte: 0 }};
  const sort = options.sort || {};
  let skip = 0;
  let limit = 100;

  if (options.skip) {
    JF.validation.checks.checkNonNegativeNumber(options.skip);
    skip = options.skip;
  }
  if (options.limit) {
    JF.validation.checks.checkNonNegativeNumber(options.limit);
    limit = options.limit;
  }
  if (options.filters) {
    Object.assign(filter, options.filters);
  }

  const orgIds = JF.user.getScuGroupsForUser(userId);
  if (orgIds.length > 0 || su) {
    filter.$or = [];
    orgIds.forEach(orgId => filter.$or.push({ organizationId: orgId }));
    const count = Studies.find(filter).count();
    StudiesCount.update({ userId }, { userId, count }, { upsert: true });
    return Studies.find(filter, { sort, skip, limit });
  } else {
    StudiesCount.update({ userId }, { userId, count: 0 }, { upsert: true });
    return this.ready();
  }
});
