import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';

Template.studylistToolbar.helpers({
  disableApplyBtn() {
    const studies = JF.studylist.getSelectedStudies();

    for (let study of studies) {
      if (!Roles.userIsInRole(Meteor.user(), 'js', study.organizationId)) {
        return true;
      }
    }

    return !studies.length;
  },
  disableApplyAllBtn() {
    const studies = JF.collections.studies.find({ status: { $gte: 0 }}).fetch();

    for (let study of studies) {
      if (!Roles.userIsInRole(Meteor.user(), 'js', study.organizationId)) {
        return true;
      }
    }

    return !studies.length;
  },
  disableRemoveBtn() {
    const studies = JF.studylist.getSelectedStudies();

    for (let study of studies) {
      if (!Roles.userIsInRole(Meteor.user(), 'admin', study.organizationId)) {
        return true;
      }
    };

    return !studies.length;
  }
});

Template.studylistToolbar.events({
  'click #applyStudies'(event, instance) {
    JF.studylist.applySelectedStudies();
  },
  'click #applyAllStudies'(event, instance) {
    const dialogSettings = {
        class: 'themed',
        title: '提交申请',
        message: '是否对列表中的所有图像提交申请?',
        position: {
            x: event.clientX,
            y: event.clientY
        },
        cancelLabel: '取消',
        confirmLabel: '确定'
    };
    OHIF.ui.showDialog('dialogConfirm', dialogSettings).then(() => {
      const filters = instance.data.filterOptions.get();
      if (!filters.status) {
        filters.status = 0;
      }
      const studies = JF.collections.studies.find(filters).fetch();
      JF.studylist.applyStudiesProgress(studies);
    });
  },
  'click #removeStudies'(event, instance) {
    JF.studylist.removeSelectedStudies(event);
  }
});
