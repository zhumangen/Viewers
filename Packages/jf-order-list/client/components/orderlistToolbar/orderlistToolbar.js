import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

Template.orderlistToolbar.helpers({
  disableStartBtn() {
    return !JF.orderlist.getSelectedOrderIds().length;
  },
  disableDenyBtn() {
    const orders = JF.orderlist.getSelectedOrders();

    for (let order of orders) {
      if (order) {
        if (!Roles.userIsInRole(Meteor.user(), ['bg','sh','admin'], order.orderOrgId)) {
          return true;
        }
        if (order.status < 0 || order.status >= 10) {
          return true;
        }
      }
    }

    return !orders.length;
  },
  disableCancelBtn() {
    const orders = JF.orderlist.getSelectedOrders();

    for (let order of orders) {
      if (!Roles.userIsInRole(Meteor.user(), ['admin'], order.studyOrgId)) {
        return true;
      }
      if (order.status !== 0) {
        return true;
      }
    }

    return !orders.length;
  },
  disableRemoveBtn() {
    const orders = JF.orderlist.getSelectedOrders();

    for (let order of orders) {
      if (!Roles.userIsInRole(Meteor.user(), ['admin'], order.studyOrgId)) {
        return true;
      }
      if (order.status > 0 && order.status < 4) {
        return true;
      }
    }

    return !orders.length;
  },
  disableExportBtn() {
    const userId = Meteor.userId();
    const options = Template.instance().data.filterOptions.get();

    if (options.studyOrgId && Roles.userIsInRole(userId, 'admin', options.studyOrgId)) {
      return false;
    }

    return true;
  }
});

Template.orderlistToolbar.events({
  'click #startOrders'(event, instance) {
    JF.orderlist.viewSelectedOrder();
  },
  'click #denyOrders'(event, instance) {
    JF.orderlist.denySelectedOrders(event);
  },
  'click #cancelOrders'(event, instance) {
    JF.orderlist.cancelSelectedOrders(event);
  },
  'click #removeOrders'(event, instance) {
    JF.orderlist.removeSelectedOrders(event);
  },
  'click #exportOrders'(event, instance) {
    JF.orderlist.exportOrders(event, instance.data.filterOptions.get());
  }
});
