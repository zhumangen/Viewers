import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.methods({
  getUser(userId) {
    JF.validation.checks.checkNonEmptyString(userId);
    const user = Meteor.users.findOne({ _id: userId }, { fields: { services: 0, previousPasswords: 0 }});
    return user;
  }
})
