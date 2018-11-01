import { JF } from 'meteor/jf:core';
import { OHIF }  from 'meteor/ohif:core';

JF.studylist.removeSelectedStudies = event => {
  const studyIds = JF.ui.rowSelect.getSelectedRows.call(JF.studylist);

  OHIF.ui.showDialog('dialogConfirm', {
      element: event.element,
      title: '删除检查',
      message: '您确定要删除这些检查吗？',
  }).then(() => {
      JF.studylist.removeStudiesProgress(studyIds);
  }).catch(() => {});
}
