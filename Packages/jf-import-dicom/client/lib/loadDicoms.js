import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';
import { Tracker } from 'meteor/tracker';

JF.dicomlist.loadDicoms = (context, options) => {
  const notify = (options || {}).notify || function() { /* noop */ };

  return new Promise((resolve, reject) => {
    Tracker.autorun(c => {
      const processed = context.loaded.get();
      const total = context.total.get();
      const msg = context.errorMsg.get();

      notify({ processed, total });
      if (processed === total || msg) {
        c.stop();
        resolve(processed);
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
          });
        }
      }
    });
  }

  return promise;
}
