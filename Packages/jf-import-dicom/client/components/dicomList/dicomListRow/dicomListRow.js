import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

Template.dicomListRow.onCreated(() => {
  this.studyLevel = this.qidoLevel === 'STUDY';
});

Template.dicomListRow.onRendered(() => {

});

Template.dicomListRow.helpers({
  selected() {
    return JF.ui.rowSelect.isRowSelected.call(JF.dicomlist, this._id);
  },
  status() {
    switch (this.status) {
      case 0:
        return '未导入';
      case 1:
        return '已导入';
    }
  },
  statusClass() {
    switch (this.status) {
      case 0:
        return 'unimported';
      case 1:
        return 'imported';
    }
  }
});

Template.dicomListRow.events({
  'click tr.dicomListRow'(event, instance) {
        const $studyRow = $(event.currentTarget);
        const rowId = instance.data._id;

        if (event.shiftKey) {
            JF.ui.rowSelect.handleShiftClick.call(JF.dicomlist, $studyRow, { rowId });
        } else if (event.ctrlKey || event.metaKey) {
            JF.ui.rowSelect.handleCtrlClick.call(JF.dicomlist, $studyRow, { rowId });
        } else {
            JF.ui.rowSelect.doSelectSingleRow.call(JF.dicomlist, $studyRow, { rowId });
        }
    },

    'mousedown tr.dicomListRow'(event, instance) {
        // This event handler is meant to handle middle-click on a study
        if (event.which !== 2) {
            return;
        }

        const middleClickOnStudy = JF.dicomlist.callbacks.middleClickOnStudy;
        if (middleClickOnStudy && typeof middleClickOnStudy === 'function') {
            middleClickOnStudy([instance.data]);
        }
    },

    'dblclick tr.dicomListRow, doubletap tr.dicomListRow'(event, instance) {
        if (event.which !== undefined && event.which !== 1) {
            return;
        }

        const dblClickOnStudy = JF.dicomlist.callbacks.dblClickOnStudy;

        if (dblClickOnStudy && typeof dblClickOnStudy === 'function') {
            dblClickOnStudy([instance.data]);
        }
    }
});
