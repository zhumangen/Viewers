import { JF } from 'meteor/jf:core';

// server side use only
export default function updateEditStatus(orderId, status, edited) {
  const Orders = JF.collections.orders;
  let ops;
  if (status === 1) {
    ops = { $set: { reportEdited: true }};
  } else if (status === 3) {
    ops = { $set: { reviewEdited: true }};
  }
  if (ops) {
    Orders.update({ _id: orderId }, ops, { multi: false });
  }
}
