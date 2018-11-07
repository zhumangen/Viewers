import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.methods({
  getUserName(userId) {
    JF.validation.checks.checkNonEmptyString(userId);
    return Meteor.users.findOne({ _id: userId }).profile.fullName;
  }
})
