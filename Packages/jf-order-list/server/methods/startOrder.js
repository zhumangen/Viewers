import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

export default function startOrder(orderId, options) {
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
    let ops;
    let userId;
    switch (order.status) {
      case 0:
        if (Roles.userIsInRole(_userId, ['bg','sh'])) {
          ops = { $set: {
            status: 1,
            reporterId: _userId,
            reportStart: new Date(),
            reportEdited: false
          }};
        } else {
          result.code = 403;
        }
        break;
      case 1:
        if (order.reporterId !== _userId) {
          result.code = 409;
        }
        result.userId = order.reporterId;
        break;
      case 2:
        if (Roles.userIsInRole(_userId, 'sh')) {
          ops = { $set: {
            status: 3,
            reviewerId: _userId,
            reviewStart: new Date(),
            reviewEdited: false
          }};
        } else {
          result.code = 403;
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

    return result;
  }
}
