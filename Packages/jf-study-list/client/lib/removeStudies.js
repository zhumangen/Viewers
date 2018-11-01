import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

JF.studylist.removeStudies = (studyIds, options) => {
  let processed = 0;
  const notify = (options || {}).notify || function() { /* noop */ };
  const promises = [];
  const total = studyIds.length;
  studyIds.forEach(studyId => {
    const promise = new Promise((resolve, reject) => {
      Meteor.call('removeStudies', [studyId], {}, (error, response) => {
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

JF.studylist.removeStudiesProgress = studies => {
  OHIF.ui.showDialog('dialogProgress', {
    title: '正在删除检查...',
    total: studies.length,
    task: {
      run: dialog => {
        JF.studylist.removeStudies(studies, {
          notify: stats => {
            dialog.update(stats.processed);
            dialog.setMessage(`已删除：${stats.processed} / ${stats.total}`);
          }
        }).then(() => {
          dialog.done();
        }, () => {
          dialog.cancel();
        }).catch(error => {
          OHIF.log.error('There was an error removing studies.');
          OHIF.log.error(error.stack);

          OHIF.log.trace();
        })
      }
    }
  });
}
