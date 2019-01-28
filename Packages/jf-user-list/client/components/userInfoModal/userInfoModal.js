import { JF } from 'meteor/jf:core';
import { ReactiveVar } from 'meteor/reactive-var';
import { OHIF } from 'meteor/ohif:core';
import { _ } from 'meteor/underscore';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

Template.userInfoModal.onCreated(() => {
  const instance = Template.instance();
  instance.groups = new ReactiveVar([]);

  instance.userData = {
    userId: instance.data.emails?instance.data.emails[0].address:'',
    userName: instance.data.profile?instance.data.profile.fullName:''
  };

  instance.autorun(() => {
    const groups = [];
    const roles = instance.data.roles;
    const orgs = JF.collections.organizations.find().fetch();
    orgs.forEach(org => {
      const group = {
        _id: org._id,
        name: org.name,
        orgTypes: org.orgTypes,
        perms: {}
      };
      if (roles && roles[org._id]) {
        const perms = roles[org._id];
        perms.forEach(perm => {
          group.perms[perm] = true;
        });
      }
      groups.push(group);
    });

    instance.groups.set(groups);
  });

  instance.data.schema = new SimpleSchema({
    userId: {
      type: String,
      label: '用户ID'
    },
    userName: {
      type: String,
      label: '用户名'
    }
  })

  instance.data.confirmDisabled = () => {
    if (!JF.user.isSuperAdmin() && instance.data._id) {
      const orgIds = JF.user.getAdminGroupsForUser(instance.data._id);
      const _orgIds = JF.user.getAdminGroupsForUser(Meteor.userId());
      return _.intersection(orgIds, _orgIds).length > 0;
    }
    return false;
  }

  instance.data.confirmCallback = userData => {
    const groups = instance.groups.get();
    const roles = {};
    const oldRoles = instance.data.roles;
    if (oldRoles && oldRoles[Roles.GLOBAL_GROUP]) {
      roles[Roles.GLOBAL_GROUP] = oldRoles[Roles.GLOBAL_GROUP];
    }
    groups.forEach(g => {
      Object.keys(g.perms).forEach(k => {
        if (g.perms[k]) {
          if (!roles[g._id]) {
            roles[g._id] = [];
          }
          roles[g._id].push(k);
        }
      });
    });

    const user = {
      _id: instance.data._id,
      userId: userData.userId,
      userName: userData.userName,
      roles
    }

    return JF.user.updateUser(user).then(() => {
      OHIF.ui.notifications.success({ text: '保存成功' });
    }, error => {
      OHIF.ui.notifications.warning({ text: error });
    }).catch(error => {
      OHIF.ui.notifications.danger({ text: error });
    });
  };
});

Template.userInfoModal.onRendered(() => {
  const instance = Template.instance();

  instance.data.$form = instance.$('form').first();
  instance.data.form = instance.data.$form.data('component');

  instance.data.form.value(instance.userData);
});
