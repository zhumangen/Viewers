import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';

Template.studylistToolbar.helpers({
  disableApplyBtn() {
    const studies = JF.studylist.getSelectedStudies();

    studies.forEach(study => {
      if (!Roles.userIsInRole(Meteor.user(), 'js', study.organizationId)) {
        return true;
      }
    });

    return !studies.length;
  },
  disableApplyAllBtn() {
    const studies = JF.collections.studies.find({ status: 0 }).fetch();

    studies.forEach(study => {
      if (!Roles.userIsInRole(Meteor.user(), 'js', study.organizationId)) {
        return true;
      }
    });

    return !studies.length;
  },
  disableRemoveBtn() {
    const studies = JF.studylist.getSelectedStudies();

    studies.forEach(study => {
      if (!Roles.userIsInRole(Meteor.user(), 'admin', study.organizationId)) {
        return true;
      }
    });

    return !studies.length;
  }
});

Template.studylistToolbar.events({
  'click #applyStudies'(event, instance) {
    JF.studylist.applySelectedStudies();
  },
  'click #applyAllStudies'(event, instance) {
    const studies = JF.collections.studies.find( { status: 0 }).fetch();
    JF.studylist.applyStudiesProgress(studies);
  },
  'click #removeStudies'(event, instance) {
    JF.studylist.removeSelectedStudies(event);
  }
});
