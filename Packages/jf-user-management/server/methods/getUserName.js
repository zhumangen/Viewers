import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.methods({
  getUserName(userId) {
    JF.validation.checks.checkNonEmptyString(userId);
    const user = Meteor.users.findOne({ _id: userId });
    if (user && user.profile) {
      return user.profile.fullName;
    }
    return '';
  }
})
