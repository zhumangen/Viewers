import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';
import { Organizations } from 'meteor/jf:organizations/both/collections/organizations';

Meteor.methods({
  retriveOrganizations(organizationIds, options) {
    const filter = {};
    if (organizationIds && organizationIds.length > 0) {
      filter.$or = [];
      organizationIds.forEach(_id => filter.$or.push({ _id }));
    }
    return Organizations.find(filter).fetch();
  },

  removeOrganizations(organizationIds, options) {
    JF.validation.checks.checkNonEmptyStringArray(organizationIds);

    const filter = { $or: [] };
    organizationIds.forEach(_id => filter.$or.push({ _id }));
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
  },

  getOrganizationName(organizationId) {
    if (!organizationId) return '';

    const org = Organizations.findOne({ _id: organizationId });
    return org?org.name:'';
  }
})
