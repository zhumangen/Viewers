import { JF } from 'meteor/jf:core';

JF.dicomlist.importDicoms = (dicoms, options) => {
  let processed = 0;
  const notify = (options || {}).notify || function() { /* noop */ };
  const promises = [];
  const total = dicoms.length;
  dicoms.forEach(dicom => {
    const promise = JF.managers.importDicom.storeDicoms([dicom]);
    promise.then(dicomIds => {
      processed++;
      JF.managers.importDicom.markImported([dicom]);
      notify({ processed, total });
    });
    promises.push(promise);
  });

  return Promise.all(promises);
}

JF.dicomlist.importDicomsProgress = dicoms => {
  if (dicoms.length > 0) {
    orgId = dicoms[0].organizationId;
    if (!Roles.userIsInRole(Meteor.user(), 'js', orgId)) {
      OHIF.ui.showDialog('dialogInfo', {
        title: '导入失败',
        reason: '未授权的操作！',
      });
      return;
    }
  } else {
    return;
  }

  OHIF.ui.showDialog('dialogProgress', {
    title: '正在导入...',
    total: dicoms.length,
    cancelDisabled: true,
    task: {
      run: dialog => {
        JF.dicomlist.importDicoms(dicoms, {
          notify: stats => {
            dialog.update(stats.processed);
            dialog.setMessage(`已导入：${stats.processed} / ${stats.total}`);
          }
        }).then(() => {
          dialog.done();
        }, () => {
          dialog.cancel();
        }).catch(error => {
          OHIF.log.error('There was an error importing dicoms metadeta.');
          OHIF.log.error(error.stack);

          OHIF.log.trace();
        });
      }
    }
  });
}
