import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

Meteor.startup(() => {
    JF.studylist.dropdown = new OHIF.ui.Dropdown();

    JF.studylist.dropdown.setItems([{
      action: JF.studylist.applySelectedStudies,
      text: '申请',
    }, {
      action: JF.studylist.viewSelectedStudies,
      text: '查看'
    }, {
      action: JF.studylist.exportSelectedStudies,
      text: '导出',
      separatorAfter: true
    }, {
      action: JF.studylist.removeSelectedStudies,
      text: '删除'
    }]);
});
