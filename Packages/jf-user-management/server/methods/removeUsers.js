import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.methods({
  removeUsers(userIds) {
    const result = { code: 200, message: '' };

    if (!userIds || !userIds.length) {
      result.code = 400;
      return result;
    }

    const userId = this.userId;
    if (!userId) {
      result.code = 401;
      return result;
    }

    const su = JF.user.isSuperAdmin();
    for (let id of userIds) {
      if (JF.user.isSuperAdmin(id) || (!su && JF.user.getAdminGroupsForUser(id).length)) {
        result.code = 403;
        return result;
      }
    }

    const filter = { $or: [] };
    userIds.forEach(_id => filter.$or.push({ _id }));
    Meteor.users.remove(filter);
    return result;
  }
});
