import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { _ } from 'meteor/underscore';

Meteor.methods({
  updateUser(user) {
    const result = { code: 200, message: '' };
    if (!user || !user.roles) {
      result.code = 400;
      return result;
    }

    const userId = this.userId;
    if (!userId) {
      result.code = 401;
      return result;
    }

    const su = JF.user.isSuperAdmin();
    const groups = JF.user.getAdminGroupsForUser(userId);
    for (let g of Object.keys(user.roles)) {
      if (!_.contains(groups, g) && !su) {
        result.code = 403;
        return result;
      }
    }

    const ops = {
      $set: {
        'profile.fullName': user.userName,
        roles: user.roles
      }
    };
    if (!user._id) {
      delete user._id;
      const t = new Date();
      ops.$set.services = { password: { bcrypt: '$2a$10$hb66tWlxx.rOCzANKD1gUeGEMBCtfuAR2wszckik47z4J6GQTFW1O', setDate: t }};
      ops.$set.emails = [{ address: user.userId, verified: false }];
      ops.$set.createdAt = t;
      ops.$set.lastLoginDate = t;
    }

    Meteor.users.update({ _id: user._id }, ops, { upsert: true });
    return result;
  }
});
