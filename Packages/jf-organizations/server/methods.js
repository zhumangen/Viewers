import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { Organizations } from 'meteor/jf:organizations/both/collections/organizations';

const writeCallback = (error, offected) => {
  if (error) {
    throw new Meteor.Error('data-write', error);
  }
}

Meteor.methods({
  retriveOrganizations(options) {
    const filter = {};
    if (options && options.organizationId) {
      filter._id = options.organizationId;
    }
    return Organizations.find(filter).fetch();
  },

  storeOrganizations(options) {
    const org = options.organization;
    const query = {
      _id: org._id
    };

    if (!org._id) {
      delete org._id;
    }

    return Organizations.update(query, org, {upsert: true}, writeCallback);
  }
})
