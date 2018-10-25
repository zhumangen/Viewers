import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

Template.dicomListToolbar.onCreated(() => {
  const instance = Template.instance();
  instance.api = {
    loadAll: options => {
      const notify = (options || {}).notify || function() { /* noop */ };
      instance.data.loadAll.set(true);

      return new Promise((resolve, reject) => {
        instance.autorun(c => {
          const processed = instance.data.loaded.get();
          const total = instance.data.total.get();
          const msg = instance.data.errorMsg.get();

          notify({ processed, total });
          if (processed === total) {
            c.stop();
            instance.data.loadAll.set(false);
            resolve(processed);
          }
          if (msg) {
            c.stop();
            instance.data.loadAll.set(false);
            reject(msg);
          }
        });
      });
    },
    saveAll: options => {
      let processed = 0;
      const notify = (options || {}).notify || function() { /* noop */ };
      const promises = [];
      const unimportedDicoms = JF.managers.importDicom.unimportedDicoms();
      const total = unimportedDicoms.length;
      unimportedDicoms.forEach(dicom => {
        const promise = JF.managers.importDicom.storeDicoms({dicoms: [dicom]});
        promise.then(dicomIds => {
          processed++;
          JF.managers.importDicom.markImported({dicoms: [dicom]});
          notify({ processed, total });
          dicomIds.forEach(dicomId => {
            JF.managers.importDicom.applyDicoms({dicomIds: [dicomId]});
          })
        });
        promises.push(promise);
      });

      return Promise.all(promises);
    }
  }
})

Template.dicomListToolbar.onRendered(() => {

})

Template.dicomListToolbar.helpers({
  allImported() {
    const instance = Template.instance();
    const total = instance.data.total.get();
    const imported = JF.managers.importDicom.numberOfImported();
    return total === imported;
  }
})

Template.dicomListToolbar.events({
  'click input[id="btnImport"]'(event, instance) {
    let promise = new Promise(resolve => resolve());
    const total = instance.data.total.get();
    const loaded = instance.data.loaded.get();
    if (loaded < total) {
      promise = OHIF.ui.showDialog('dialogProgress', {
        title: '正在拉取图像信息...',
        message: `已拉取：0 / ${total}`,
        total,
        task: {
          run: dialog => {
            instance.api.loadAll({
              notify: stats => {
                dialog.update(stats.processed);
                dialog.setMessage(`已拉取：${stats.processed} / ${stats.total}`);
              }
            }).then(processed => {
              dialog.done(processed);
            }, () => {
              dialog.cancel();
            }).catch(error => {
              OHIF.log.error('There was an error retrieving dicoms metadata.');
              OHIF.log.error(error.stack);

              OHIF.log.trace();
            })
          }
        }
      });
    }

    promise.then(() => {
      OHIF.ui.showDialog('dialogProgress', {
        title: '正在导入...',
        message: `已导入：0 / ${total}`,
        total,
        task: {
          run: dialog => {
            instance.api.saveAll({
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
            })
          }
        }
      })
    });
  }
})
