import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

Meteor.startup(() => {
    JF.organizationlist.dropdown = new OHIF.ui.Dropdown();

    JF.organizationlist.dropdown.setItems([{
      action: JF.organizationlist.viewSelectedOrganization,
      text: '查看',
    }, {
      action: JF.organizationlist.removeSelectedOrganizations,
      text: '删除',
    }]);
});
