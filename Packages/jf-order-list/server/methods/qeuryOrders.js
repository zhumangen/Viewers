import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.methods({
  queryOrders(orderIds, options) {
    if (!orderIds || !orderIds.length) return;

    let filter = {
      $or: orderIds.map(orderId => { return { serialNumber: orderId }; })
    };
    return JF.collections.orders.find(filter).fetch();
  }
})
