import { JF } from 'meteor/jf:core';
import { OHIF }  from 'meteor/ohif:core';

JF.orderlist.denySelectedOrders = event => {
  const orders = JF.orderlist.getSelectedOrders();

  OHIF.ui.showDialog('dialogConfirm', {
      element: event.element,
      title: '拒绝申请',
      message: '您确定要拒绝这些申请吗？',
      position: {
        x: event.clientX,
        y: event.clientY
      },
      cancelLabel: '取消',
      confirmLabel: '确定'
  }).then(() => {
      JF.orderlist.denyOrdersProgress(orders);
  }).catch(() => {});
}
