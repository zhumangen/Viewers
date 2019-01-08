import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

JF.organizationlist.removeOrganizations = (orgIds, options) => {
  let processed = 0;
  const notify = (options || {}).notify || function() { /* noop */ };
  const promises = [];
  const total = orgIds.length;
  orgIds.forEach(orgId => {
    const promise = JF.organization.removeOrganizations([orgId]);
    promise.then(() => {
      processed++;
      notify({processed, total});
    });
    promises.push(promise);
  });

  return Promise.all(promises);
}

JF.organizationlist.removeOrganizationsProgress = orgIds => {
  return OHIF.ui.showDialog('dialogProgress', {
    title: '正在删除机构...',
    total: orgIds.length,
    task: {
      run: dialog => {
        JF.organizationlist.removeOrganizations(orgIds, {
          notify: stats => {
            dialog.update(stats.processed);
            dialog.setMessage(`已删除：${stats.processed} / ${stats.total}`);
          }
        }).then(() => {
          dialog.done();
        }, () => {
          dialog.cancel();
        }).catch(error => {
          OHIF.log.error('There was an error removing organizations.');
          OHIF.log.error(error.stack);

          OHIF.log.trace();
        })
      }
    }
  });
}
