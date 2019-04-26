import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { _ } from 'meteor/underscore';

Meteor.methods({
  getUser(userId) {
    let user;
    if (!!userId && _.isString(userId)) {
      JF.validation.checks.checkNonEmptyString(userId);
      user = Meteor.users.findOne({ _id: userId }, { fields: { services: 0, previousPasswords: 0 }});
    }

    return user;
  }
})
