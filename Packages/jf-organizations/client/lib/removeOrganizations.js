import { Meteor } from 'meteor/meteor';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';

JF.organization.removeOrganizations = (organizationIds, options) => {
  OHIF.log.info('removing organizations...');

  return new Promise((resolve, reject) => {
    Meteor.call('removeOrganizations', organizationIds, options, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}
