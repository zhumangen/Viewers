import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

Meteor.startup(() => {
    JF.userlist.dropdown = new OHIF.ui.Dropdown();

    JF.userlist.dropdown.setItems([{
      action: JF.userlist.viewSelectedUser,
      text: '查看',
    }, {
      action: JF.userlist.removeSelectedUsers,
      text: '删除',
    }]);
});
