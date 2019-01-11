import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';
import { Organizations } from 'meteor/jf:organizations/both/collections/organizations';

Meteor.methods({
  retrieveOrganizations(orgIds, options) {
    const filter = { status: { $gte: 0 }};

    if (options && options.type) {
      JF.validation.checks.checkNonEmptyString(options.type);
      filter[`orgTypes.${options.type}`] = true;
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

  storeOrganization(org, options) {
    const result = { code: 200 };

    if (!org) {
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
      _id: org._id
    };
    const ops = {
      $set: {
        name: org.name,
        fullName: org.fullName,
        serverId: org.serverId,
        orgTypes: org.orgTypes
      }
    };
    if (org.qidoLevel) {
      ops.$set.qidoLevel = org.qidoLevel;
    }
    if (org.orderOrgId) {
      ops.$set.orderOrgId = org.orderOrgId;
    }
    if (org.lesionCode) {
      ops.$set.lesionCode = org.lesionCode;
    }
    if (org.filters) {
      ops.$set.filters = org.filters;
    }
    if (!org._id) {
      // new organization
      const t = new Date();
      ops.$set.status = 0;
      ops.$set.serialNumber = '3' + t.getTime() + JF.utils.randomString();
      ops.$set.createdAt = t;
      ops.$set.createdBy = userId;
    }
    Organizations.update(query, ops, { upsert: true }, OHIF.MongoUtils.writeCallback);
    return result;
  }
})
