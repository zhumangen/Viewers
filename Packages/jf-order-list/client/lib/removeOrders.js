import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

JF.orderlist.removeOrders = (orderIds, options) => {
  let processed = 0;
  const notify = (options || {}).notify || function() { /* noop */ };
  const promises = [];
  const total = orderIds.length;
  orderIds.forEach(orderId => {
    const promise = new Promise((resolve, reject) => {
      Meteor.call('removeOrders', [orderId], {}, (error, response) => {
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

JF.orderlist.removeOrdersProgress = orderIds => {
  OHIF.ui.showDialog('dialogProgress', {
    title: '正在删除...',
    total: orderIds.length,
    task: {
      run: dialog => {
        JF.orderlist.removeOrders(orderIds, {
          notify: stats => {
            dialog.update(stats.processed);
            dialog.setMessage(`已删除：${stats.processed} / ${stats.total}`);
          }
        }).then(() => {
          dialog.done();
        }, () => {
          dialog.cancel();
        }).catch(error => {
          OHIF.log.error('There was an error removing orders.');
          OHIF.log.error(error.stack);

          OHIF.log.trace();
        })
      }
    }
  });
}
