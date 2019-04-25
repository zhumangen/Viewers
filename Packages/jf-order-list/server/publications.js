import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.startup(() => {
  Meteor.server.onConnection(connection => {
    connection.onClose(() => {
      JF.collections.ordersCount.remove({ sessionId: connection.id });
    });
  });
});

Meteor.publish('ordersCount', function(options) {
  return JF.collections.ordersCount.find({ sessionId: this._session.id });
});

Meteor.publish('orders', function(options) {
  JF.validation.checks.checkNonEmptyString(options.type);

  const Orders = JF.collections.orders;
  const OrdersCount = JF.collections.ordersCount;
  const filter = { status: { $gte: 0 }};
  const sort = options.sort || {};
  let skip = 0;
  let limit = 100;
  let timerHandle = null;

  if (options.skip) {
    JF.validation.checks.checkNonNegativeNumber(options.skip);
    skip = options.skip;
  }
  if (options.limit) {
    JF.validation.checks.checkNonNegativeNumber(options.limit);
    limit = options.limit;
  }

  const userId = this.userId;
  const sessionId = this._session.id;
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

  const clearTimer = () => {
    if (timerHandle) {
      Meteor.clearInterval(timerHandle);
      timerHandle = null;
    }
  }

  this.onStop(clearTimer);

  if (orgIds.length > 0 || su) {
    const updateCount = () => {
      const count = Orders.find(filter).count();
      OrdersCount.update({ sessionId }, { sessionId, count }, { upsert: true });
    }
    
    clearTimer();
    timerHandle = Meteor.setInterval(updateCount, 3000);
    updateCount();
    
    return Orders.find(filter, { sort, skip, limit });
  } else {
    clearTimer();
    OrdersCount.update({ sessionId }, { sessionId, count: 0 }, { upsert: true });
    return [];
  }
});
