import { JF } from 'meteor/jf:core';
import { Template } from 'meteor/templating';

JF.organization.getOrganizationName = organizationId => {
  if (!organizationId) return '';

  const Organizations = JF.organization.organizations;
  const org = Organizations.findOne({ _id: organizationId });
  if (org) {
    return org.name;
  } else {
    JF.organization.getOrganization(organizationId);
  }

  return '';
}

Template.registerHelper('getOrganizationName', organizationId => JF.organization.getOrganizationName(organizationId));
