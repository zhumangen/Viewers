import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.publish('orders', options => {
  return JF.collections.orders.find({ removed: false });
});
