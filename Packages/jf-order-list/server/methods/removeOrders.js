import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

export default function removeOrders(orderIds, options) {
  OHIF.MongoUtils.validateUser();
  if (!orderIds || !orderIds.length) return;

  const collection = JF.collections.orders;
  orderIds.forEach(orderId => {
    collection.update({ _id: orderId }, { $set: { removed: true }}, OHIF.MongoUtils.writeCallback);
  });
}
