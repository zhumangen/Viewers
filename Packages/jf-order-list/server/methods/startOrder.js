import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

export default function startOrder(orderId, options) {
  if (!orderId) return { code: 400 };

  OHIF.MongoUtils.validateUser();

  const Orders = JF.collections.orders;
  const order = Orders.findOne({ _id: orderId });
  if (order) {
    let ops;
    let userId;
    switch (order.status) {
      case 0:
        ops = { $set: {
          status: 1,
          reporterId: Meteor.userId(),
          reportStart: new Date(),
          reportEdited: false
        }};
        break;
      case 1:
        if (order.reporterId === Meteor.userId()) {
          return { code : 200 };
        }
        userId = order.reporterId;
        break;
      case 2:
        ops = { $set: {
          status: 3,
          reviewerId: Meteor.userId(),
          reviewStart: new Date(),
          reviewEdited: false
        }};
        break;
      case 3:
        if (order.reviewerId === Meteor.userId()) {
          return { code : 200 };
        }
        userId = order.reviewerId;
        break;
    }

    if (ops) {
      Orders.update({ _id: orderId }, ops, OHIF.MongoUtils.writeCallback);
      return { code: 200 }
    } else {
      return { code: 403, status: order.status, userId }
    }
  }
}
