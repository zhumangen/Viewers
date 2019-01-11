import { JF } from 'meteor/jf:core';

JF.organization.getLocalOrganizations = function(orgIds, options) {
  const orgs = [];

  if (orgIds.length > 0) {
    const filter = { $or: [] };
    _.each(orgIds, _id => filter.$or.push({ _id }));
    if (options.type) {
      filter[`orgTypes.${options.type}`] = true;
    }
    orgs = this.find(filter).fetch();
  }

  return orgs;
}
