import { JF } from 'meteor/jf:core';

JF.organization.getLocalOrganizations = (orgIds, options) => {
  const orgs = [];

  if (orgIds.length > 0) {
    options = options || {};
    const Organizations = JF.organization.organizations;
    const filter = { $or: [] };
    _.each(orgIds, _id => filter.$or.push({ _id }));
    _.extend(filter, options);
    orgs = Organizations.find(filter).fetch();
  }

  return orgs;
}
