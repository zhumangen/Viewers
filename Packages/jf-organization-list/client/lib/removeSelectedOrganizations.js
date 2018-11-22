import { JF } from 'meteor/jf:core';
import { OHIF }  from 'meteor/ohif:core';

JF.organizationlist.removeSelectedOrganizations = event => {
  const orgIds = JF.ui.rowSelect.getSelectedRows.call(JF.organizationlist);

  OHIF.ui.showDialog('dialogConfirm', {
      element: event.element,
      title: '删除机构',
      message: '您确定要删除这些机构吗？',
  }).then(() => {
      JF.organizationlist.removeOrganizationsProgress(orgIds);
  }).catch(() => {});
}
