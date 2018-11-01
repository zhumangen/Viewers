import { Meteor } from 'meteor/meteor';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';

Meteor.startup(() => {
    JF.dicomlist.dropdown = new OHIF.ui.Dropdown();

    JF.dicomlist.dropdown.setItems([{
      action: JF.dicomlist.importSelectedDicoms,
      text: '导入'
    }, {
      action: JF.dicomlist.viewSelectedDicoms,
      text: '查看'
    }]);
});
