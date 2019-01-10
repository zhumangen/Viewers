import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

Template.organizationlistToolbar.helpers({
  disableAddBtn() {
    return !JF.user.isSuperAdmin();
  },
  disableUpdateBtn() {
    return !JF.organizationlist.getSelectedOrgIds().length;
  },
  disableRemoveBtn() {
    return !JF.user.isSuperAdmin() || !JF.organizationlist.getSelectedOrgIds().length;
  }
});

Template.organizationlistToolbar.events({
  'click #addOrg'(event, instance) {
    JF.organizationlist.updateOrganization({});
  },
  'click #updateOrg'(event, instance) {
    JF.organizationlist.updateSelectedOrganization();
  },
  'click #removeOrgs'(event, instance) {
    JF.organizationlist.removeSelectedOrganizations(event);
  }
});
