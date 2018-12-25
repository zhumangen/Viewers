import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.publish('orders', options => {
  JF.validation.checks.checkNonEmptyString(options.type);

  const Orders = JF.collections.orders;

  const filter = {
    removed: false
  };

  if (JF.user.isSuperAdmin()) {
    return Orders.find(filter);
  }

  const userId = this.userId;
  filter.$or = [];
  let orgIds = [];
  if (options.type === 'SCP') {
    orgIds = JF.user.getScpGroupsForUser(userId);
    orgIds.forEach(orgId => {
      filter.$or.push({ orderOrgId: orgId });
    });
  } else if (optins.type === 'SCU') {
    orgIds = JF.user.getScuGroupsForUser(userId);
    orgIds.forEach(orgId => {
      fitler.$or.push( { organizationId: orgId });
    })
  }

  if (filter.$or.length > 0) {
    return Orders.find(filter);
  }
});
