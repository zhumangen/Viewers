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
    const promise = new Promise((resolve, reject) => {
      Meteor.call('applyStudies', [study], options.applyData, (error, response) => {
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
  let org;
  for (let study of studies) {
    const orgId = study.organizationId;
    if (!Roles.userIsInRole(Meteor.user(), 'js', orgId)) {
      msg = '未授权的操作！';
    }
    if (!msg && !org) {
      const orgs = JF.organization.getLocalOrganizations.call(JF.organization.organizations, [orgId]);
      if (orgs.length > 0) {
        org = orgs[0];
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

  OHIF.ui.showDialog('applyStudyModal', {
    applyInfo: {
      orderOrgId: org.orderOrgId,
      lesionCode: org.lesionCode
    }
  }).then(applyData => {
    OHIF.ui.showDialog('dialogProgress', {
      title: '正在处理申请...',
      total: studies.length,
      cancelDisabled: true,
      task: {
        run: dialog => {
          JF.studylist.applyStudies(studies, {
            notify: stats => {
              dialog.update(stats.processed);
              dialog.setMessage(`已申请：${stats.processed} / ${stats.total}`);
            },
            applyData
          }).then(() => {
            dialog.done();
          }, () => {
            dialog.cancel();
          }).catch(error => {
            OHIF.log.error('There was an error applying studies.');
            OHIF.log.error(error.stack);

            OHIF.log.trace();
          });
        }
      }
    });
  });
}
