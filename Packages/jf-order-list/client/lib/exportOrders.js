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
        console.log(result);
        resolve(result.data);
      }
    });
  });

  OHIF.ui.showDialog('dialogLoading', {
    id: 'export-orders-waiting',
    text: '正在导出...',
    promise
  });
}
