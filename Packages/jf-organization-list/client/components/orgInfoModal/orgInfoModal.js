import { JF } from 'meteor/jf:core';
import { ReactiveVar } from 'meteor/reactive-var';
import { OHIF } from 'meteor/ohif:core';
import { _ } from 'meteor/underscore';
import { OrgInfoSchema, ScuOrgInfoSchema } from 'meteor/jf:organization-list/client/lib/orgInfoSchema.js';

Template.orgInfoModal.onCreated(() => {
  const instance = Template.instance();

  const scu = instance.data.organization.orgTypes?instance.data.organization.orgTypes.SCU:false;
  instance.data.hasScuType = new ReactiveVar(scu);
  instance.orderOrgItems = new ReactiveVar([]);
  instance.schema = new ReactiveVar(OrgInfoSchema);
  JF.organization.retrieveOrganizations([], { type: 'SCP' }).then(orgs => {
    instance.orderOrgItems.set(orgs.map(org => { return { value: org._id, label: org.name }; }));
  });

  instance.data.confirmCallback = formData => {
    const org = _.clone(formData);
    org._id = instance.data.organization._id;

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
    const scuComponent = instance.$('[data-key="orgTypes.SCU"] :input').data('component');
    scuComponent.depend();
    const hasScu = scuComponent.value();
    instance.data.hasScuType.set(hasScu);
    instance.schema.set(hasScu?ScuOrgInfoSchema:OrgInfoSchema);
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
