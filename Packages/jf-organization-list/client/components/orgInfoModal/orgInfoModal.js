import { JF } from 'meteor/jf:core';
import { ReactiveVar } from 'meteor/reactive-var';
import { OHIF } from 'meteor/ohif:core';
import { _ } from 'meteor/underscore';
import OrgInfoSchema from 'meteor/jf:organization-list/client/lib/orgInfoSchema.js';

Template.orgInfoModal.onCreated(() => {
  const instance = Template.instance();

  instance.data.schema = OrgInfoSchema;
  instance.data.organization.SCU = instance.data.organization.type && instance.data.organization.type.indexOf('SCU') > -1;
  instance.data.organization.SCP = instance.data.organization.type && instance.data.organization.type.indexOf('SCP') > -1;
  instance.data.hasScuType = new ReactiveVar(instance.data.organization.SCU || false);
  instance.orderOrgItems = new ReactiveVar([]);
  JF.organization.retrieveOrganizations([], { type: 'SCP' }).then(orgs => {
    instance.orderOrgItems.set(orgs.map(org => { return { value: org._id, label: org.name }; }));
  });

  instance.data.confirmCallback = formData => {
    const org = _.clone(formData);
    org._id = instance.data.organization._id;
    org.type = [];

    const checkOrgType = type => {
      const idx = org.type.indexOf(type);
      if (formData[type] && idx === -1) {
        org.type.push(type);
      }
    }

    checkOrgType('SCU');
    checkOrgType('SCP');
    delete org.SCU;
    delete org.SCP;

    JF.organization.storeOrganization(org).then(() => {
      OHIF.ui.notifications.success({ text: '保存成功' });
    }, error => {
      OHIF.ui.notifications.warning({ text: '保存失败：' + error});
    }).catch(error => {
      OHIF.ui.notifications.danger({ text: '崩溃了：' + error});
    })
  }
});

Template.orgInfoModal.onRendered(() => {
  const instance = Template.instance();

  instance.data.$form = instance.$('form').first();
  instance.data.form = instance.data.$form.data('component');

  instance.autorun(() => {
    const scuComponent = instance.$('[data-key=SCU] :input').data('component');
    scuComponent.depend();

    instance.data.hasScuType.set(scuComponent.value());
  });

  instance.autorun(() => {
    instance.orderOrgItems.get();
    Meteor.defer(() => instance.data.form.value(instance.data.organization));
  });
});

Template.orgInfoModal.helpers({
  serverItems() {
    return OHIF.servers.getServerItems();
  },
  orderOrgItems() {
    return Template.instance().orderOrgItems.get();
  },
  lesionCodeItems() {
    return JF.lesiontracker.getLesionCodes();
  }
});
