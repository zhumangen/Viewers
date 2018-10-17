import { JF } from 'meteor/jf:core';
import { OrganizationsManager } from 'meteor/jf:organizations/client/classes/OrganizationsManager';

const Organizations = new OrganizationsManager();
JF.managers.organizations = Organizations;

export { Organizations };
