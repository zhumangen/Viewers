import { JF } from 'meteor/jf:core';

/**
 * Loads multiple unassociated orders in the Viewer
 */
JF.orderlist.viewOrder = order => {
  if (!order) return;

  JF.managers.settings.viewerApis().then(api => {
    let path = '/viewer/orders/' + order.serialNumber;
    open(path, api.window.name, api.window.features, api.window.replace);
  });
};

JF.orderlist.callbacks.dblClickOnStudy = JF.orderlist.viewOrder;
JF.orderlist.callbacks.middleClickOnStudy = JF.orderlist.viewOrder;
