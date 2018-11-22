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
  userName() {
    return this.profile.fullName?this.profile.fullName:this.username;
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
    },

    'contextmenu tr.userlistRow, press tr.userlistRow'(event, instance) {
        const $studyRow = $(event.currentTarget);
        const rowId = instance.data._id;

        if (!JF.ui.rowSelect.isRowSelected.call(JF.userlist, rowId)) {
            JF.ui.rowSelect.doSelectSingleRow.call(JF.userlist, $studyRow, { rowId });
        }

        event.preventDefault();
        OHIF.ui.showDropdown(JF.userlist.dropdown.getItems(), {
            event,
            menuClasses: 'dropdown-menu-left'
        });
        return false;
    }
});
