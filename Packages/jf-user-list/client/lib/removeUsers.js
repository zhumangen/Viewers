import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

JF.userlist.removeUsers = (userIds, options) => {
  let processed = 0;
  const notify = (options || {}).notify || function() { /* noop */ };
  const promises = [];
  const total = userIds.length;
  userIds.forEach(userId => {
    const promise = JF.user.removeUsers([userId]);
    promise.then(() => {
      processed++;
      notify({processed, total});
    });
    promises.push(promise);
  });

  return Promise.all(promises);
}

JF.userlist.removeUsersProgress = userIds => {
  return OHIF.ui.showDialog('dialogProgress', {
    title: '正在删除用户...',
    total: userIds.length,
    task: {
      run: dialog => {
        JF.userlist.removeUsers(userIds, {
          notify: stats => {
            dialog.update(stats.processed);
            dialog.setMessage(`已删除：${stats.processed} / ${stats.total}`);
          }
        }).then(() => {
          dialog.done();
        }, () => {
          dialog.cancel();
        }).catch(error => {
          OHIF.log.error('There was an error removing users.');
          OHIF.log.error(error.stack);

          OHIF.log.trace();
        })
      }
    }
  });
}
