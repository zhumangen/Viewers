import { Meteor } from 'meteor/meteor';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';

JF.organization.retrieveOrganizations = (organizationIds, options) => {
  OHIF.log.info('retrieving organizations...');

  return new Promise((resolve, reject) => {
    const Organizations = JF.organization.organizations;
    Meteor.call('retrieveOrganizations', organizationIds, options, (error, orgs) => {
      if (error) {
        reject(error);
      } else {
        orgs.forEach(org => {
          Organizations.update({ _id: org._id }, org, { upsert: true });
        });
        resolve(orgs);
      }
    });
  });
}
