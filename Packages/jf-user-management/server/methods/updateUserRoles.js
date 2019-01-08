import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { _ } from 'meteor/underscore';

Meteor.methods({
  updateUserRoles(user) {
    const result = { code: 200, message: '' };
    if (!user || !user._id || !user.roles) {
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

    Meteor.users.update({ _id: user._id }, { $set: { roles: user.roles }});
    return result;
  }
});
