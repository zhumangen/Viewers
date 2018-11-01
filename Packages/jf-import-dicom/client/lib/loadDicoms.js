import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';
import { Tracker } from 'meteor/tracker';

JF.dicomlist.loadDicoms = (context, options) => {
  const notify = (options || {}).notify || function() { /* noop */ };
  context.loadAll.set(true);

  return new Promise((resolve, reject) => {
    Tracker.autorun(c => {
      const processed = context.loaded.get();
      const total = context.total.get();
      const msg = context.errorMsg.get();
      const loadAll = context.loadAll.get();

      notify({ processed, total });
      if (processed === total || !loadAll) {
        c.stop();
        context.loadAll.set(false);
        resolve(processed);
      }
      if (msg) {
        c.stop();
        context.loadAll.set(false);
        reject(msg);
      }
    });
  });
}

JF.dicomlist.loadDicomsProgress = context => {
  let promise = new Promise(resolve => resolve());
  const total = context.total.get();
  const loaded = context.loaded.get();
  if (loaded < total) {
    promise = OHIF.ui.showDialog('dialogProgress', {
      title: '正在拉取图像信息...',
      total,
      task: {
        run: dialog => {
          JF.dicomlist.loadDicoms(context, {
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

  return promise;
}
