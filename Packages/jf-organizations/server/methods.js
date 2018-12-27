import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';
import { Organizations } from 'meteor/jf:organizations/both/collections/organizations';

Meteor.methods({
  retrieveOrganizations(orgIds, options) {
    const filter = {};

    if (options && options.type) {
      JF.validation.checks.checkNonEmptyString(options.type);
      filter.type = options.type;
    }

    if (orgIds && orgIds.length > 0) {
      filter.$or = [];
      orgIds.forEach(_id => filter.$or.push({ _id }));
    }

    return Organizations.find(filter).fetch();
  },

  removeOrganizations(orgIds, options) {
    JF.validation.checks.checkNonEmptyStringArray(orgIds);

    const filter = { $or: [] };
    orgIds.forEach(_id => filter.$or.push({ _id }));
    Organizations.update(filter, { $set: { removed: true }}, { multi: true }, OHIF.MongoUtils.writeCallback);
  },

  storeOrganization(organization, options) {
    const query = {
      _id: organization._id
    };
    if (!organization._id) {
      // new organization
      delete organization._id;
      const t = new Date();
      organization.serialNumber = '3' + t.getTime() + JF.utils.randomString();
      organization.createdAt = t;
      organization.userId = Meteor.userId();
      organization.removed = false;
    }

    Organizations.update(query, organization, { upsert: true }, OHIF.MongoUtils.writeCallback);
  }
})
