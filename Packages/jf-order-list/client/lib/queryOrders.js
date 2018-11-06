import { JF } from 'meteor/jf:core';
import { Meteor } from 'meteor/meteor';

JF.orderlist.queryOrders = orderIds => {
  return new Promise((resolve, reject) => {
    Meteor.call('queryOrders', orderIds, {}, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}
