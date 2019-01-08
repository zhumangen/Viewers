import { JF } from 'meteor/jf:core';

JF.orderlist.clearSelections = () => {
  JF.ui.rowSelect.doClearSelections.call(JF.orderlist);
}

JF.orderlist.getSelectedOrderIds = () => {
  return JF.ui.rowSelect.getSelectedRows.call(JF.orderlist);
};

JF.orderlist.getSelectedOrders = () => {
  const rowIds = JF.orderlist.getSelectedOrderIds();
  return rowIds.map(rowId => JF.collections.orders.find({ _id: rowId }).fetch()[0]);
};
