import { JF } from 'meteor/jf:core';
import { OHIF }  from 'meteor/ohif:core';

JF.orderlist.removeSelectedOrders = event => {
  const orders = JF.orderlist.getSelectedOrders();

  OHIF.ui.showDialog('dialogConfirm', {
      element: event.element,
      title: '删除申请',
      message: '您确定要删除这些申请吗？',
      position: {
        x: event.clientX,
        y: event.clientY
      },
      cancelLabel: '取消',
      confirmLabel: '确定'
  }).then(() => {
      JF.orderlist.removeOrdersProgress(orders).then(() => {
        JF.orderlist.clearSelections();
      });
  }).catch(() => {});
}
