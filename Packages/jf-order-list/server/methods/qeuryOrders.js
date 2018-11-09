import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

export default function queryOrders(orderIds, options) {
  OHIF.MongoUtils.validateUser();
  if (!orderIds || !orderIds.length) return;

  let filter = {
    $or: orderIds.map(orderId => { return { serialNumber: orderId }; })
  };
  return JF.collections.orders.find(filter).fetch();
}
