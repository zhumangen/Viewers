import { JF } from 'meteor/jf:core';
import { _ } from 'meteor/underscore';

JF.organization.getLocalOrganizations = function(orgIds, options) {
  const filter = {};
  const items = [];
  const nonEmptyIds = _.isArray(orgIds) && orgIds.length > 0;

  if (options && options.type) {
    filter[`orgTypes.${options.type}`] = true;
  }

  if (nonEmptyIds) {
    filter = { $or: [] };
    _.each(orgIds, _id => filter.$or.push({ _id }));
  }

  if (nonEmptyIds || options && options.findAll) {
    items = this.find(filter).fetch();
  }

  return items;
}
