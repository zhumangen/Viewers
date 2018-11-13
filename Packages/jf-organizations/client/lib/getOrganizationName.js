import { JF } from 'meteor/jf:core';
import { Template } from 'meteor/templating';

const OrganizationPromises = new Map();

JF.organization.getOrganizationName = organizationId => {
  if (OrganizationPromises.has(organizationId)) {
    return OrganizationPromises.get(organizationId);
  }

  const promise = new Promise((resolve, reject) => {
    const Organizations = JF.organization.organizations;
    const org = Organizations.findOne({ _id: organizationId });
    if (org) {
      resolve(org.name);
    } else {
      Meteor.call('getOrganizationName', organizationId, (error, response) => {
        if (error) {
          reject(error);
        } else {
          Organizations.insert({ _id: organizationId, name: response });
          resolve(response);
        }
      });
    }
  });

  OrganizationPromises.set(organizationId, promise);
  return promise;
}

JF.organization.getOrganizationNameSync = organizationId => {
  if (!organizationId) return '';

  const Organizations = JF.organization.organizations;
  const org = Organizations.findOne({ _id: organizationId });
  if (org) {
    return org.name;
  } else {
    JF.organization.getOrganizationName(organizationId);
  }

  return '';
}

Template.registerHelper('getOrganizationName', organizationId => JF.organization.getOrganizationNameSync(organizationId));
