import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { resolve } from 'path';
import { rejects } from 'assert';

JF.orderlist.exportOrders = (event, options) => {
  const promise = new Promise((resolve, reject) => {
    Meteor.call('exportOrders', options, (error, result) => {
      if (error) {
        throw new Meteor.Error('exportOrders', error);
      } else {
        if (result.code === 200) {
          resolve(result.data);
        } else if (result.code === 400) {
          reject('400: 未知请求！');
        } else if (result.code === 401) {
          reject('401：用户未登录！');
        } else if (result.code === 403) {
          reject('403: 未授权的操作！')
        } else {
          reject('服务器内部错误。');
        }
      }
    });
  });

  OHIF.ui.showDialog('dialogLoading', {
    id: 'export-orders-waiting',
    text: '正在导出...',
    promise
  }).then(data => {
    const aLink = document.createElement('a');
    aLink.download = 'data.json';
    aLink.style.display = 'none';
    const dataStr = JSON.stringify(data);
    const blob = new Blob([dataStr]);
    aLink.href = URL.createObjectURL(blob);
    document.body.appendChild(aLink);
    aLink.click();
    document.body.removeChild(aLink);
  }, reason => {
    OHIF.ui.showDialog('dialogInfo', {
      title: '访问受限',
      reason
    });
  });
}
