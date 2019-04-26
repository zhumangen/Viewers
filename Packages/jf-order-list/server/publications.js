import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.publish('orders', function(options) {
  JF.validation.checks.checkNonEmptyString(options.type);

  const Orders = JF.collections.orders;
  const filter = { status: { $gte: 0 }};
  const userId = this.userId;
  const su = JF.user.isSuperAdmin();

  if (options.filter) {
    Object.assign(filter, options.filter);
  }

  let orgIds = [];
  let orgKey = '';
  if (options.type === 'SCP') {
    filter.status.$lte = 10;
    orgIds = JF.user.getScpGroupsForUser(userId);
    orgKey = 'orderOrgId';
  } else if (options.type === 'SCU') {
    orgIds = JF.user.getScuGroupsForUser(userId);
    orgKey = 'studyOrgId';
  }

  if (su) {
    orgIds = [];
  }

  if (orgIds.length > 0) {
    filter.$or = [];
    orgIds.forEach(orgId => {
      const item = {};
      item[`${orgKey}`] = orgId;
      filter.$or.push(item);
    });
  }

  if (orgIds.length > 0 || su) {
    return Orders.find(filter);
  }

  return this.ready();
});
