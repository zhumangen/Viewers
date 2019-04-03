import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { OrdersCount } from '../both/collections/orders';

Meteor.publish('ordersCount', function(options) {
  return JF.collections.ordersCount.find({ userId: this.userId });
});

Meteor.publish('orders', function(options) {
  JF.validation.checks.checkNonEmptyString(options.type);

  const Orders = JF.collections.orders;
  const ordersCount = JF.collections.ordersCount;
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

  const userId = this.userId;
  const su = JF.user.isSuperAdmin();

  if (options.filters) {
    Object.assign(filter, options.filters);
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
    const count = Orders.find(filter).count();
    OrdersCount.update({ userId }, { userId, count }, { upsert: true });
    return Orders.find(filter, { sort, skip, limit });
  } else {
    OrdersCount.update({ userId }, { userId, count: 0 }, { upsert: true });
    return this.ready();
  }
});
