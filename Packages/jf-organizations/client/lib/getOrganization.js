import { Meteor } from 'meteor/meteor';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';

const OrganizationPromises = new Map();

JF.organization.getOrganization = (organizationId, options) => {
  if (OrganizationPromises.has(organizationId)) {
    return OrganizationPromises.get(organizationId);
  }

  const promise = new Promise((resolve, reject) => {
    const Organizations = JF.organization.organizations;
    const org = Organizations.findOne({ _id: organizationId });
    if (org) {
      resolve(org);
    } else {
      Meteor.call('retrieveOrganizations', [organizationId], options, (error, orgs) => {
        if (error) {
          reject(error);
        } else {
          let org;
          if (orgs.length > 0) {
            org = orgs[0];
            Organizations.insert(org);
          }
          resolve(org);
        }
      });
    }
  });

  OrganizationPromises.set(organizationId, promise);
  return promise;
}
