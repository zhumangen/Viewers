import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

/**
 * Loads multiple unassociated orders in the Viewer
 */
JF.orderlist.viewOrder = order => {
  if (!order) return;

  new Promise((resolve, reject) => {
    Meteor.call('startOrder', order._id, { type: Session.get('locationType') }, (error, response) => {
      if (error) {
        OHIF.log.error(error);
      } else {
        if (response.code === 200) {
          resolve();
        } else if (response.code === 403) {
          reject('未授权的操作！');
        } else if (response.code === 409) {
          const userId = response.userId;
          const status = '标注';
          if (response.status === 3) {
            status = '审核';
          }
          JF.user.getUserName(userId).then(userName => {
            reject(`该病例正在由${userName}${status}中`);
          });
        } else {
          reject('服务器内部错误。');
        }
      }
    });
  }).then(() => {
    JF.managers.settings.viewerApis().then(api => {
      let path = '/viewer/orders/' + order.serialNumber;
      open(path, api.window.name, api.window.features, api.window.replace);
    });
  }, reason => {
      OHIF.ui.showDialog('dialogInfo', {
        title: '访问受限',
        reason
      });
  });
};

JF.orderlist.callbacks.dblClickOnStudy = JF.orderlist.viewOrder;
JF.orderlist.callbacks.middleClickOnStudy = JF.orderlist.viewOrder;
