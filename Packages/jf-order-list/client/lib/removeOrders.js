import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

JF.orderlist.removeOrders = (orders, options) => {
  let processed = 0;
  const notify = (options || {}).notify || function() { /* noop */ };
  const promises = [];
  const total = orders.length;
  orders.forEach(order => {
    const promise = new Promise((resolve, reject) => {
      Meteor.call('removeOrders', [order._id], {}, (error, response) => {
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

JF.orderlist.removeOrdersProgress = orders => {
  // check permissions
  for (let order of orders) {
    if (!Roles.userIsInRole(Meteor.user(), ['admin'], order.studyOrgId)) {
      OHIF.ui.showDialog('dialogInfo', {
        title: '删除失败',
        reason: '未授权的操作！',
      });
      return;
    }
  }

  return OHIF.ui.showDialog('dialogProgress', {
    title: '正在删除...',
    total: orders.length,
    task: {
      run: dialog => {
        JF.orderlist.removeOrders(orders, {
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
