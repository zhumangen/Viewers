import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import queryOrders from './qeuryOrders';
import removeOrders from'./removeOrders';
import startOrder from './startOrder';
import endOrder from './endOrder';
import updateEditStatus from './updateEditStatus';

const methods = {
  queryOrders,
  removeOrders,
  startOrder,
  endOrder
};

Meteor.methods(methods);
Object.assign(JF.orderlist, methods, { updateEditStatus });
