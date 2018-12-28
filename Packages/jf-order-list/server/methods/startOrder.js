import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

export default function startOrder(orderId, options) {
  JF.validation.checks.checkNonEmptyString(options.type);
  const result = { code: 200 };

  if (!orderId || typeof orderId !== 'string') {
    result.code = 400;
    return result;
  }

  const _userId = this.userId;
  if (!_userId) {
    result.code = 401;
    return result;
  }

  const Orders = JF.collections.orders;
  const order = Orders.findOne({ _id: orderId });
  if (order) {
    if (options.type === 'SCP') {
      let ops;
      let userId;
      switch (order.status) {
        case 0:
          if (Roles.userIsInRole(_userId, ['bg','sh'], order.orderOrgId)) {
            ops = { $set: {
              status: 1,
              reporterId: _userId,
              reportStart: new Date(),
              reportEdited: false
            }};
          }
          break;
        case 1:
          if (order.reporterId !== _userId) {
            result.code = 409;
          }
          result.userId = order.reporterId;
          break;
        case 2:
          if (Roles.userIsInRole(_userId, 'sh', order.orderOrgId)) {
            ops = { $set: {
              status: 3,
              reviewerId: _userId,
              reviewStart: new Date(),
              reviewEdited: false
            }};
          }
          break;
        case 3:
          if (order.reviewerId !== _userId) {
            result.code = 409;
          }
          result.userId = order.reviewerId;
          break;
      }

      if (ops) {
        Orders.update({ _id: orderId }, ops, OHIF.MongoUtils.writeCallback);
      }
    }
  } else {
    result.code = 404;
  }

  return result;
}
