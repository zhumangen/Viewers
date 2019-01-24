import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

Template.orderlistRow.helpers({
  selected() {
    return JF.ui.rowSelect.isRowSelected.call(JF.orderlist, this._id);
  },
  status() {
    const s = this.status;
    switch (s) {
      case -1:
        return '已删除';
      case 0:
        return '待标注';
      case 1:
        return '标注中';
      case 2:
        return '待审核';
      case 3:
        return '审核中';
      case 4:
        return '已审核';
      case 10:
        return '已拒绝';
      case 11:
        return '已撤回';
    }
  },
  statusClass() {
    const s = this.status;
    switch (s) {
      case -1:
        return 'deleted';
      case 0:
        return 'unreported';
      case 1:
        return 'reporting';
      case 2:
        return 'unreviewed';
      case 3:
        return 'reviewing';
      case 4:
        return 'reviewed';
      case 10:
        return 'refused';
      case 11:
        return 'revoked';
    }
  }
});

Template.orderlistRow.events({
  'click tr.orderlistRow'(event, instance) {
    const $studyRow = $(event.currentTarget);
    const rowId = instance.data._id;

    if (event.shiftKey) {
        JF.ui.rowSelect.handleShiftClick.call(JF.orderlist, $studyRow, { rowId });
    } else if (event.ctrlKey || event.metaKey) {
        JF.ui.rowSelect.handleCtrlClick.call(JF.orderlist, $studyRow, { rowId });
    } else {
        JF.ui.rowSelect.doSelectSingleRow.call(JF.orderlist, $studyRow, { rowId });
    }
  },

  'mousedown tr.orderlistRow'(event, instance) {
    // This event handler is meant to handle middle-click on a study
    if (event.which !== 2) {
      return;
    }

    const middleClickOnStudy = JF.orderlist.callbacks.middleClickOnStudy;
    if (middleClickOnStudy && typeof middleClickOnStudy === 'function') {
      middleClickOnStudy(instance.data);
    }
  },

  'dblclick tr.orderlistRow, doubletap tr.orderlistRow'(event, instance) {
    if (event.which !== undefined && event.which !== 1) {
      return;
    }

    const dblClickOnStudy = JF.orderlist.callbacks.dblClickOnStudy;

    if (dblClickOnStudy && typeof dblClickOnStudy === 'function') {
      dblClickOnStudy(instance.data);
    }
  }
});
