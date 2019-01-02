import { JF } from 'meteor/jf:core';

JF.organization.getLocalOrganizations = function(orgIds, options) {
  const orgs = [];

  if (orgIds.length > 0) {
    options = options || {};
    const filter = { $or: [] };
    _.each(orgIds, _id => filter.$or.push({ _id }));
    _.extend(filter, options);
    orgs = this.find(filter).fetch();
  }

  return orgs;
}
