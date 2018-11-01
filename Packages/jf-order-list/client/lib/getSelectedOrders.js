import { JF } from 'meteor/jf:core';

JF.orderlist.getSelectedOrders = () => {
  const rowIds = JF.ui.rowSelect.getSelectedRows.call(JF.orderlist);
  return rowIds.map(rowId => JF.collections.orders.find({ _id: rowId }).fetch()[0]);
};
