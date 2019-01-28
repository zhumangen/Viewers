import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

export default function endOrder(orderId, options) {
  const result = { code: 400 };
  const userId = this.userId;

  if (!orderId || typeof orderId !== 'string') {
    return result;
  }

  if (!userId) {
    result.code = 401;
    return result;
  }

  // 0: abort, 1: submit
  const action = options.action;
  JF.validation.checks.checkNonNegativeNumber(action);
  let reportRating = 0;
  if (options.rating) {
    JF.validation.checks.checkNonNegativeNumber(options.rating);
    reportRating = options.rating;
  }

  const Orders = JF.collections.orders;
  const order = Orders.findOne({ _id: orderId });
  if (order) {
    let ops;
    switch (order.status) {
      case -1:
      case 0:
      case 2:
      case 4:
      case 10:
      case 11:
        result.code = 409;
        break;
      case 1:
        if (order.reporterId === userId) {
          result.code = 200;
          if (action === 0) {
            ops = { $set: {
              status: 0,
              reporterId: '',
              reportStart: null
            }};
          } else if (action === 1) {
            ops = { $set: {
              status: 2,
              reportEnd: new Date()
            }};
            JF.measurements.updateMeasurementStatus(order._id, 1);
          }
        } else {
          result.code = 403;
        }
        break;
      case 3:
        if (order.reviewerId === userId) {
          result.code = 200;
          if (action === 0) {
            ops = { $set: {
              status: 2,
              reviewerId: '',
              reviewStart: null
            }};
          } else if (action === 1) {
            ops = { $set: {
              status: 4,
              reportRating,
              reviewEnd: new Date()
            }};
            JF.measurements.updateMeasurementStatus(order._id, 2);
          }
        } else {
          result.code = 403;
        }
        break;
    }

    if (ops) {
      Orders.update({ _id: orderId }, ops, OHIF.MongoUtils.writeCallback);
    }

    return result;
  }
}
