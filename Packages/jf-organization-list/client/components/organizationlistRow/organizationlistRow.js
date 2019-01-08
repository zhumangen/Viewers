import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

Template.organizationlistRow.onCreated(() => {

});

Template.organizationlistRow.onRendered(() => {

});

Template.organizationlistRow.helpers({
  selected() {
    return JF.ui.rowSelect.isRowSelected.call(JF.organizationlist, this._id);
  }
});

Template.organizationlistRow.events({
  'click tr.organizationlistRow'(event, instance) {
        const $studyRow = $(event.currentTarget);
        const rowId = instance.data._id;

        if (event.shiftKey) {
            JF.ui.rowSelect.handleShiftClick.call(JF.organizationlist, $studyRow, { rowId });
        } else if (event.ctrlKey || event.metaKey) {
            JF.ui.rowSelect.handleCtrlClick.call(JF.organizationlist, $studyRow, { rowId });
        } else {
            JF.ui.rowSelect.doSelectSingleRow.call(JF.organizationlist, $studyRow, { rowId });
        }
    },

    'mousedown tr.organizationlistRow'(event, instance) {
        // This event handler is meant to handle middle-click on a study
        if (event.which !== 2) {
            return;
        }

        const middleClickOnStudy = JF.organizationlist.callbacks.middleClickOnStudy;
        if (middleClickOnStudy && typeof middleClickOnStudy === 'function') {
            middleClickOnStudy(instance.data);
        }
    },

    'dblclick tr.organizationlistRow, doubletap tr.organizationlistRow'(event, instance) {
        if (event.which !== undefined && event.which !== 1) {
            return;
        }

        const dblClickOnStudy = JF.organizationlist.callbacks.dblClickOnStudy;

        if (dblClickOnStudy && typeof dblClickOnStudy === 'function') {
            dblClickOnStudy(instance.data);
        }
    }
});
