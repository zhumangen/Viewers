import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

JF.orderlist.denyOrders = (orders, options) => {
  let processed = 0;
  const notify = (options || {}).notify || function() { /* noop */ };
  const promises = [];
  const total = orders.length;
  orders.forEach(order => {
    const promise = new Promise((resolve, reject) => {
      Meteor.call('denyOrders', [order._id], {}, (error, response) => {
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

JF.orderlist.denyOrdersProgress = orders => {
  // check permissions
  for (let order of orders) {
    if (!Roles.userIsInRole(Meteor.user(), ['bg','sh','admin'], order.orderOrgId)) {
      OHIF.ui.showDialog('dialogInfo', {
        title: '拒绝失败',
        reason: '未授权的操作！',
      });
      return;
    }
  }

  OHIF.ui.showDialog('dialogProgress', {
    title: '正在拒绝...',
    total: orders.length,
    task: {
      run: dialog => {
        JF.orderlist.denyOrders(orders, {
          notify: stats => {
            dialog.update(stats.processed);
            dialog.setMessage(`已拒绝：${stats.processed} / ${stats.total}`);
          }
        }).then(() => {
          dialog.done();
        }, () => {
          dialog.cancel();
        }).catch(error => {
          OHIF.log.error('There was an error denying orders.');
          OHIF.log.error(error.stack);

          OHIF.log.trace();
        })
      }
    }
  });
}
