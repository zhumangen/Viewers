import { JF } from 'meteor/jf:core';
import { OHIF }  from 'meteor/ohif:core';

JF.userlist.removeSelectedUsers = event => {
  const userIds = JF.ui.rowSelect.getSelectedRows.call(JF.userlist);

  OHIF.ui.showDialog('dialogConfirm', {
      element: event.element,
      title: '删除用户',
      message: '您确定要删除这些用户吗？',
  }).then(() => {
      JF.userlist.removeUsersProgress(userIds);
  }).catch(() => {});
}
