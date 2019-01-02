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

    orders.forEach(order => {
      if (!Roles.userIsInRole(Meteor.user(), ['bg','sh','admin'], order.orderOrgId)) {
        return true;
      }
    });

    return !orders.length;
  },
  disableCancelBtn() {
    const orders = JF.orderlist.getSelectedOrders();

    orders.forEach(order => {
      if (!Roles.userIsInRole(Meteor.user(), ['admin'], order.studyOrgId)) {
        return true;
      }
    });

    return !orders.length;
  },
  disableRemoveBtn() {
    const orders = JF.orderlist.getSelectedOrders();

    orders.forEach(order => {
      if (!Roles.userIsInRole(Meteor.user(), ['admin'], order.studyOrgId)) {
        return true;
      }
    });

    return !orders.length;
  }
});

Template.orderlistToolbar.events({
  'click #startOrders'(event, instance) {
    JF.orderlist.viewSelectedOrder();
  },
  'click #denyOrders'(event, instance) {
    JF.orderlist.denySelectedOrders();
  },
  'click #cancelOrders'(event, instance) {
    JF.orderlist.cancelSelectedOrders(event);
  },
  'click #removeOrders'(event, instance) {
    JF.orderlist.removeSelectedOrders(event);
  }
});
