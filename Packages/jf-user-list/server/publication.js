import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.publish('users', options => {
  return Meteor.users.find({}, { fields: { services: 0 }});
});
