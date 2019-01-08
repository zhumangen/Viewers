import { JF } from 'meteor/jf:core';
import { OHIF }  from 'meteor/ohif:core';

JF.studylist.removeSelectedStudies = event => {
  const studies = JF.studylist.getSelectedStudies();

  OHIF.ui.showDialog('dialogConfirm', {
      element: event.element,
      title: '删除检查',
      message: '您确定要删除这些检查吗？',
      position: {
        x: event.clientX,
        y: event.clientY
      },
      cancelLabel: '取消',
      confirmLabel: '确定'
  }).then(() => {
      JF.studylist.removeStudiesProgress(studies).then(() => {
        JF.studylist.clearSelections();
      })
  }).catch(() => {});
}
