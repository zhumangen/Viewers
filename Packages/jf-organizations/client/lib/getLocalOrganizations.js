import { JF } from 'meteor/jf:core';

JF.organization.getLocalOrganizations = (orgIds, options) => {
  options = options || {};
  const Organizations = JF.organization.organizations;
  const filter = { $or: [] };
  _.each(orgIds, _id => filter.$or.push({ _id }));
  _.extend(filter, options);
  return JF.organization.organizations.find(filter).fetch();
}
