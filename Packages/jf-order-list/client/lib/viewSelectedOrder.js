import { JF } from 'meteor/jf:core';

/**
 * Loads multiple unassociated orders in the Viewer
 */
JF.orderlist.viewSelectedOrder = () => {
  const orders = JF.orderlist.getSelectedOrders();
  JF.orderlist.viewOrders(orders.length?orders[0]:undefined);
};
