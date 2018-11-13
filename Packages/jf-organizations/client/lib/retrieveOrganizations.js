import { Meteor } from 'meteor/meteor';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';

JF.organization.retrieveOrganizations = (organizationIds, options) => {
  OHIF.log.info('retrieving organizations...');

  return new Promise((resolve, reject) => {
    Meteor.call('retriveOrganizations', organizationIds, options, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}
