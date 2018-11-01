import { JF } from 'meteor/jf:core';
import { OHIF }  from 'meteor/ohif:core';

JF.orderlist.removeSelectedOrders = () => {
  const orderIds = JF.ui.rowSelect.getSelectedRows.call(JF.orderlist);

  OHIF.ui.showDialog('dialogConfirm', {
      element: event.element,
      title: '删除申请',
      message: '您确定要删除这些申请吗？',
  }).then(() => {
      JF.orderlist.removeOrdersProgress(orderIds);
  }).catch(() => {});
}
