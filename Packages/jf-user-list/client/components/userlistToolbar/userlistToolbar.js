import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

Template.userlistToolbar.helpers({
  disableAddBtn() {
    return false;
  },
  disableUpdateBtn() {
    return !JF.userlist.getSelectedUserIds().length;
  },
  disableRemoveBtn() {
    const userIds = JF.userlist.getSelectedUserIds();
    for (let userId of userIds) {
      if (Meteor.userId() === userId) {
        return true;
      }
      if (JF.user.isSuperAdmin(userId) || (JF.user.hasAdminRoles(userId) && !JF.user.isSuperAdmin())) {
        return true;
      }
    }
    return !userIds.length;
  }
});

Template.userlistToolbar.events({
  'click #addUser'(event, instance) {
    JF.userlist.updateUser();
  },
  'click #updateUser'(event, instance) {
    JF.userlist.updateSelectedUser();
  },
  'click #removeUsers'(event, instance) {
    JF.userlist.removeSelectedUsers(event);
  }
});
