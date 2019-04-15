import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { _ } from 'meteor/underscore';

Meteor.methods({
  getUsersWithSameGroups(roles) {
    let users = [];
    if (!_.isArray(roles)) {
      roles = [roles];
    }

    const userId = this.userId;
    let gs = JF.user.getAllGroupsForUser(userId);

    if (JF.user.isSuperAdmin(userId)) {
      const orgs = JF.collections.organizations.find({}, {fields: { _id: 1 }}).fetch();
      gs = [];
      orgs.map(org => gs.push(org._id));
    }

    if (gs && gs.length > 0) {
      const filter = { $or: [] };
      gs.forEach(g => {
        const en = {};
        en[`roles.${g}`] = { $in: roles };
        filter.$or.push(en);
      });

      users = Meteor.users.find(filter).fetch();
    }

    return users;
  }
});