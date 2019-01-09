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
    const result = { code: 200 };

    if (!orgIds || !orgIds.length) {
      result.code = 400;
      return result;
    }

    const userId = this.userId;
    if (!userId) {
      result.code = 401;
      return result;
    }

    const su = JF.user.isSuperAdmin();
    if (!su) {
      result.code = 403;
      return result;
    }

    const filter = { $or: [] };
    orgIds.forEach(_id => filter.$or.push({ _id }));
    Organizations.update(filter, { $set: { status: -1 }}, { multi: true }, OHIF.MongoUtils.writeCallback);
    return result;
  },

  storeOrganization(organization, options) {
    const result = { code: 200 };

    if (!organization) {
      result.code = 400;
      return result;
    }

    const userId = this.userId;
    if (!userId) {
      result.code = 401;
      return result;
    }

    const su = JF.user.isSuperAdmin();
    if (!su) {
      result.code = 403;
      return result;
    }

    const query = {
      _id: organization._id
    };
    if (!organization._id) {
      // new organization
      delete organization._id;
      const t = new Date();
      organization.status = 0;
      organization.serialNumber = '3' + t.getTime() + JF.utils.randomString();
      organization.createdAt = t;
      organization.createdBy = userId;
    }
    Organizations.update(query, organization, { upsert: true }, OHIF.MongoUtils.writeCallback);
    return result;
  }
})
