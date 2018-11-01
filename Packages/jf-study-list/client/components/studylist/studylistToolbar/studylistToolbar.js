import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';

Template.studylistToolbar.onCreated(() => {
    const instance = Template.instance();
    instance.api = {
      apply: () => {
        const studies = JF.collections.studies.find().fetch();
        return new Promise((resolve, reject) => {
          Meteor.call('applyStudies', studies, {}, (error, response) => {
            if (error) {
              reject(error);
            } else {
              resolve(response);
            }
          });
        });
      }
    }
});

Template.studylistToolbar.events({
    'click .js-apply-studies'(event, instance) {
        instance.api.apply();
    }
});

Template.studylistToolbar.helpers({

});
