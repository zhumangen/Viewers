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

  storeOrganization(organization, options) {
    const query = {
      _id: organization._id
    };
    if (!organization._id) {
      delete organization._id;
    }
    Organizations.update(query, organization, { upsert: true }, OHIF.MongoUtils.writeCallback);
  },

  getOrganizationName(organizationId) {
    if (!organizationId) return '';

    const org = Organizations.findOne({ _id: organizationId });
    return org?org.name.zh:'';
  }
})
