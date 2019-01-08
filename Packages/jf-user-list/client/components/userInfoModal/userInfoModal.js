import { JF } from 'meteor/jf:core';
import { ReactiveVar } from 'meteor/reactive-var';
import { OHIF } from 'meteor/ohif:core';

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
        type: org.type,
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

  instance.data.confirmDisabled = JF.user.isSuperAdmin(instance.data._id);

  instance.data.confirmCallback = () => {
    const groups = instance.groups.get();
    const userData = instance.data.form.value();
    const roles = {};
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

    return JF.user.updateUserRoles({ _id: instance.data._id, roles }).then(() => {
      instance.data.message = '保存成功';
    }, error => {
      instance.data.error = error;
    }).catch(error => {
      instance.data.error = error;
    });
  };
});

Template.userInfoModal.onRendered(() => {
  const instance = Template.instance();

  instance.data.$form = instance.$('form').first();
  instance.data.form = instance.data.$form.data('component');

  instance.data.form.value(instance.userData);
});
