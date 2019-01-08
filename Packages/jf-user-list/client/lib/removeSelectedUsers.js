import { JF } from 'meteor/jf:core';
import { OHIF }  from 'meteor/ohif:core';

JF.userlist.removeSelectedUsers = event => {
  const userIds = JF.userlist.getSelectedUserIds();

  OHIF.ui.showDialog('dialogConfirm', {
      element: event.element,
      title: '删除用户',
      message: '您确定要删除这些用户吗？',
      position: {
        x: event.clientX,
        y: event.clientY
      },
      cancelLabel: '取消',
      confirmLabel: '确定'
  }).then(() => {
      JF.userlist.removeUsersProgress(userIds).then(() => {
        JF.userlist.clearSelections();
      });
  }).catch(() => {});
}
