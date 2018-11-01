import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

Meteor.startup(() => {
    JF.orderlist.dropdown = new OHIF.ui.Dropdown();

    JF.orderlist.dropdown.setItems([{
      action: JF.orderlist.viewSelectedOrder,
      text: '查看',
      separatorAfter: true
    }, {
      action: JF.orderlist.removeSelectedOrders,
      text: '删除'
    }]);
});
