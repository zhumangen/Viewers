import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.methods({
  removeOrders(orderIds, options) {
    if (!orderIds || !orderIds.length) return;

    const collection = JF.collections.orders;
    orderIds.forEach(orderId => {
      collection.update({ _id: orderId }, { $set: { removed: true }});
    });
  }
})
