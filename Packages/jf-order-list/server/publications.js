import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.publish('orders', function(options) {
  JF.validation.checks.checkNonEmptyString(options.type);

  const Orders = JF.collections.orders;
  const filter = { status: { $gte: 0 }};
  const userId = this.userId;
  const su = JF.user.isSuperAdmin();

  let orgIds = [];
  if (options.type === 'SCP') {
    filter.status.$lte = 10;
    orgIds = JF.user.getScpGroupsForUser(userId);
  } else if (options.type === 'SCU') {
    orgIds = JF.user.getScuGroupsForUser(userId);
  }

  if (su) {
    orgIds = [];
  }

  if (orgIds.length > 0) {
    filter.$or = [];
    orgIds.forEach(orgId => {
      filter.$or.push({ orderOrgId: orgId });
    });
  }

  if (orgIds.length > 0 || su) {
    return Orders.find(filter);
  }

  return this.ready();
});
