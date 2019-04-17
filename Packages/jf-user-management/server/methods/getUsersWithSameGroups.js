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

    if (JF.user.isSuperAdmin(userId)) {
      Meteor.users.find({}).forEach(u => {
        const gs = Object.keys(u.roles);
        for (let g of gs) {
          if (_.intersection(u.roles[g], roles).length > 0) {
            users.push(u);
            break;
          }
        }
      });
    } else {
      let gs = JF.user.getAllGroupsForUser(userId);
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