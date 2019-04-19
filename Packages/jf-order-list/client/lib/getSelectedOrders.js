import { JF } from 'meteor/jf:core';
import { _ } from 'meteor/underscore';

JF.orderlist.clearSelections = () => {
  JF.ui.rowSelect.doClearSelections.call(JF.orderlist);
}

JF.orderlist.getSelectedOrderIds = () => {
  return JF.ui.rowSelect.getSelectedRows.call(JF.orderlist);
};

JF.orderlist.getSelectedOrders = () => {
  const rowIds = JF.orderlist.getSelectedOrderIds();
  return _.compact(rowIds.map(rowId => JF.collections.orders.findOne({ _id: rowId })));
};
