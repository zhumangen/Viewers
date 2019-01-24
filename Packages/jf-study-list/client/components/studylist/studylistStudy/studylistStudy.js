import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import Hammer from 'hammerjs';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

Template.studylistStudy.helpers({
  selected() {
    return JF.ui.rowSelect.isRowSelected.call(JF.studylist, this._id);
  },
  status() {
    switch (this.status) {
      case 0:
        return '未申请';
      case 1:
        return '已申请';
      default:
        return '';
    }
  },
  statusClass() {
    switch (this.status) {
      case 0:
        return 'unapplied';
      case 1:
        return 'applied';
      default:
        return '';
    }
  }
});

Template.studylistStudy.onCreated(() => {
  this.studyLevel = this.qidoLevel === 'STUDY';
})

Template.studylistStudy.onRendered(() => {
    const instance = Template.instance();
    const data = instance.data;
    const $row = instance.$('tr.studylistStudy').first();

    // Enable HammerJS to allow touch support
    const mc = new Hammer.Manager($row.get(0));
    const doubleTapRecognizer = new Hammer.Tap({
        event: 'doubletap',
        taps: 2,
        interval: 500,
        threshold: 30,
        posThreshold: 30
    });
    mc.add(doubleTapRecognizer);

    // Check if current row has been previously selected
    if (data.selected) {
        doSelectRow($row, data);
    }
});

Template.studylistStudy.events({
  'click tr.studylistStudy'(event, instance) {
    const $studyRow = $(event.currentTarget);
    const rowId = instance.data._id;

    if (event.shiftKey) {
      JF.ui.rowSelect.handleShiftClick.call(JF.studylist, $studyRow, { rowId });
    } else if (event.ctrlKey || event.metaKey) {
      JF.ui.rowSelect.handleCtrlClick.call(JF.studylist, $studyRow, { rowId });
    } else {
      JF.ui.rowSelect.doSelectSingleRow.call(JF.studylist, $studyRow, { rowId });
    }
  },

  'mousedown tr.studylistStudy'(event, instance) {
    // This event handler is meant to handle middle-click on a study
    if (event.which !== 2) {
      return;
    }

    const middleClickOnStudy = JF.studylist.callbacks.middleClickOnStudy;
    if (middleClickOnStudy && typeof middleClickOnStudy === 'function') {
      middleClickOnStudy([instance.data]);
    }
  },

  'dblclick tr.studylistStudy, doubletap tr.studylistStudy'(event, instance) {
    if (event.which !== undefined && event.which !== 1) {
      return;
    }

    const dblClickOnStudy = JF.studylist.callbacks.dblClickOnStudy;

    if (dblClickOnStudy && typeof dblClickOnStudy === 'function') {
      dblClickOnStudy([instance.data]);
    }
  }
});
