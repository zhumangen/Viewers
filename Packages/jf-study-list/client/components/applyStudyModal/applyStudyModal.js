import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ReactiveVar } from 'meteor/reactive-var';

Template.applyStudyModal.onCreated(() => {
  const instance = Template.instance();

  instance.data.schema = new SimpleSchema({
    orderOrgId: {
      type: String,
      label: '影像中心'
    },
    lesionCode: {
      type: String,
      label: '标注类型'
    }
  });

  instance.applyOrgs = new ReactiveVar([]);
  JF.organization.retrieveOrganizations([], { type: 'SCP' }).then(orgs => {
    instance.applyOrgs.set(orgs.map(org => { return { value: org._id, label: org.name }; }));
  });
});

Template.applyStudyModal.onRendered(() => {
  const instance = Template.instance();

  instance.data.form = instance.$('form').first().data('component');

  instance.autorun(() => {
    const orgs = instance.applyOrgs.get();
    if (orgs && orgs.length > 0) {
      Meteor.defer(() => instance.data.form.value(instance.data.applyInfo));
    }
  });
});

Template.applyStudyModal.helpers({
  applyOrgs() {
    return Template.instance().applyOrgs.get();
  },
  lesionCodes() {
    return JF.lesiontracker.getLesionCodes();
  }
});
