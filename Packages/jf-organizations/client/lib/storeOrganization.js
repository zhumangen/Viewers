import { Meteor } from 'meteor/meteor';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';

JF.organization.storeOrganization = (organization, options) => {
  OHIF.log.info('storing organizations...');

  return new Promise((resolve, reject) => {
    Meteor.call('storeOrganization', organization, options, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}
//
// Meteor.startup(() => {
//   JF.organization.storeOrganization({"name":{"zh":"九峰医疗"},"serverId":"743DjEJQnJgeRmmXS","filter":{},"qidoLevel":"SERIES"});
// })
