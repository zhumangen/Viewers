import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

Template.userlistRow.onCreated(() => {

});

Template.userlistRow.onRendered(() => {

});

Template.userlistRow.helpers({
  selected() {
    return JF.ui.rowSelect.isRowSelected.call(JF.userlist, this._id);
  },
  userId() {
    return this.emails[0].address;
  },
  userOrgs() {
    const orgIds = JF.user.getAllGroupsForUser(this._id);
    const orgs = JF.organization.getLocalOrganizations.call(JF.collections.organizations, orgIds);
    let str = '';
    orgs.forEach(org => str += org.name + '，');
    return str.substring(0, str.length-1);
  }
});

Template.userlistRow.events({
  'click tr.userlistRow'(event, instance) {
        const $studyRow = $(event.currentTarget);
        const rowId = instance.data._id;

        if (event.shiftKey) {
            JF.ui.rowSelect.handleShiftClick.call(JF.userlist, $studyRow, { rowId });
        } else if (event.ctrlKey || event.metaKey) {
            JF.ui.rowSelect.handleCtrlClick.call(JF.userlist, $studyRow, { rowId });
        } else {
            JF.ui.rowSelect.doSelectSingleRow.call(JF.userlist, $studyRow, { rowId });
        }
    },

    'mousedown tr.userlistRow'(event, instance) {
        // This event handler is meant to handle middle-click on a study
        if (event.which !== 2) {
            return;
        }

        const middleClickOnStudy = JF.userlist.callbacks.middleClickOnStudy;
        if (middleClickOnStudy && typeof middleClickOnStudy === 'function') {
            middleClickOnStudy(instance.data);
        }
    },

    'dblclick tr.userlistRow, doubletap tr.userlistRow'(event, instance) {
        if (event.which !== undefined && event.which !== 1) {
            return;
        }

        const dblClickOnStudy = JF.userlist.callbacks.dblClickOnStudy;

        if (dblClickOnStudy && typeof dblClickOnStudy === 'function') {
            dblClickOnStudy(instance.data);
        }
    }
});
