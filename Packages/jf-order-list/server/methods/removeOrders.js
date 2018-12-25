import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

export default function removeOrders(orderIds, options) {
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
    const ops = {
      $set: {
        removed: true,
        removedAt: new Date(),
        removedBy: userId
      }
    };
    collection.update({ _id: orderId }, ops, OHIF.MongoUtils.writeCallback);
  });

  return result;
}
