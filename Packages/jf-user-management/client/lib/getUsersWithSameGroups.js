import { JF } from 'meteor/jf:core';

JF.user.getUsersWithSameGroups = roles => {
  Meteor.call('getUsersWithSameGroups', roles, (error, users) => {
    if (error) {
      throw new Meteor.Error('getUsersWithSameGroups', error);
    } else {
      users.forEach(user => {
        JF.user.users.upsert({_id: user._id}, user);
      });
    }
  });
}