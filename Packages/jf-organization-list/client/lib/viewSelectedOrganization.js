import { JF } from 'meteor/jf:core';

JF.organizationlist.viewSelectedOrganization = () => {
  const organizations = JF.organizationlist.getSelectedOrganizations();
  JF.organizationlist.viewOrganization(organizations.length?organizations[0]:null);
};
