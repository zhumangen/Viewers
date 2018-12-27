import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

Template.applyStudyModal.events({
  'change #applyOrg'(event, instance) {
    instance.data.indexes.orgIdx = event.currentTarget.options.selectedIndex;
  },
  'change #lesionType'(event, instance) {
    instance.data.indexes.typeIdx = event.currentTarget.options.selectedIndex;
  }
});
