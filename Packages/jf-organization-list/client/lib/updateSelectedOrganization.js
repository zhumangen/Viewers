import { JF } from 'meteor/jf:core';

JF.organizationlist.updateSelectedOrganization = () => {
  const organizations = JF.organizationlist.getSelectedOrganizations();
  JF.organizationlist.updateOrganization(organizations.length?organizations[0]:null);
};
