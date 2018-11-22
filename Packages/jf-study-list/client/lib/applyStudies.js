import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

JF.studylist.applyStudies = (studies, options) => {
  let processed = 0;
  options = options || {};
  const notify = options.notify || function() { /* noop */ };
  const promises = [];
  const total = studies.length;
  studies.forEach(study => {
    const promise = new Promise((resolve, reject) => {
      Meteor.call('applyStudies', [study], { orderOrgId: options.orgId }, (error, response) => {
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
  OHIF.ui.showDialog('dialogProgress', {
    title: '正在处理申请...',
    total: studies.length,
    task: {
      run: dialog => {
        JF.studylist.applyStudies(studies, {
          notify: stats => {
            dialog.update(stats.processed);
            dialog.setMessage(`已申请：${stats.processed} / ${stats.total}`);
          }
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
}
