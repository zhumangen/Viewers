import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

export default function denyOrders(orderIds, options) {
  const result = { code: 200 };
  const userId = this.userId;

  if (!userId) {
    result.code = 401;
    return result;
  }

  if (!orderIds || !orderIds.length) {
    result.code = 400;
    return result;
  }

  const collection = JF.collections.orders;
  orderIds.forEach(orderId => {
    const order = collection.findOne({ _id: orderId });
    if (order) {
      if (Roles.userIsInRole(userId, ['bg','sh','admin'], order.orderOrgId)) {
        if (order.status >= 0 && order.status < 4) {
          const ops = {
            $set: {
              status: 10
            }
          };
          collection.update({ _id: orderId }, ops, OHIF.MongoUtils.writeCallback);
        } else {
          result.code = 409;
        }
      } else {
        result.code = 403;
      }
    } else {
      result.code = 404;
    }
  });

  return result;
}
