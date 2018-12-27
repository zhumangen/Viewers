import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';
import { resolveSoa } from 'dns';

JF.studylist.applyStudies = (studies, options) => {
  let processed = 0;
  options = options || {};
  const notify = options.notify || function() { /* noop */ };
  const promises = [];
  const total = studies.length;
  studies.forEach(study => {
    const options2 = {
      orderOrgId: options.applyOrgId,
      lesionCode: options.lesionType
    };
    const promise = new Promise((resolve, reject) => {
      Meteor.call('applyStudies', [study], options2, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
    promise.then(() => {
      processed++;
      notify({processed, total});
    });
    promises.push(promise);
  });

  return Promise.all(promises);
}

JF.studylist.applyStudiesProgress = studies => {
  if (!studies || studies.length === 0) {
    return;
  }

  // check permissions
  let msg;
  for (let study of studies) {
    const orgId = study.organizationId;
    if (!Roles.userIsInRole(Meteor.user(), 'js', orgId)) {
      msg = '未授权的操作！';
    }
    if (!msg && !JF.user.isSuperAdmin()) {
      const orgs = JF.organization.getLocalOrganizations([orgId]);
      if (orgs.length > 0) {
        const org = orgs[0];
        if (!org.orderOrgId) {
          msg = org.name + '未配置申请目标机构！';
        } else if (!org.lesionCode) {
          msg = org.name + '未配置申请目标标注类型！';
        }
      } else {
        // something went wrong, shouldn't be here.
        msg = '未找到的机构：' + orgId;
      }
    }

    if (msg) {
      OHIF.ui.showDialog('dialogInfo', {
        title: '申请失败',
        reason: msg,
      });
      return;
    }
  }

  // apply options
  let applyOrgs;
  const lesionTypes = JF.lesiontracker.getLesionTypes();
  const indexes = { orgIdx: 0, typeIdx: 0 };
  let promise = JF.organization.retrieveOrganizations([], { type: 'SCP' }).then(orgs => {
    applyOrgs = orgs.map(org => { return { value: org._id, label: org.name }; });
  });

  promise.then(() => {
    OHIF.ui.showDialog('applyStudyModal', {
      applyOrgs,
      lesionTypes,
      indexes
    }).then(() => {
      OHIF.ui.showDialog('dialogProgress', {
        title: '正在处理申请...',
        total: studies.length,
        task: {
          run: dialog => {
            JF.studylist.applyStudies(studies, {
              notify: stats => {
                dialog.update(stats.processed);
                dialog.setMessage(`已申请：${stats.processed} / ${stats.total}`);
              },
              applyOrgId: applyOrgs[indexes.orgIdx].value,
              lesionType: lesionTypes[indexes.typeIdx].value
            }).then(() => {
              dialog.done();
            }, () => {
              dialog.cancel();
            }).catch(error => {
              OHIF.log.error('There was an error applying studies.');
              OHIF.log.error(error.stack);

              OHIF.log.trace();
            })
          }
        }
      });
    });
  });
}
