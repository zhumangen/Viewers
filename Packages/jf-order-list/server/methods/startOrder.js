import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

export default function startOrder(orderId, options) {
  const result = { code: 200 };
  if (!orderId) {
    result.code = 400;
    return result;
  }

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
        if (order.reporterId !== Meteor.userId()) {
          result.code = 403;
        }
        result.userId = order.reporterId;
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
        if (order.reviewerId !== Meteor.userId()) {
          result.code = 403;
        }
        result.userId = order.reviewerId;
        break;
    }

    if (ops) {
      Orders.update({ _id: orderId }, ops, OHIF.MongoUtils.writeCallback);
    }

    return result;
  }
}
