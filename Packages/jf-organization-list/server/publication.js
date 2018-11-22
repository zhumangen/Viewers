import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.publish('organizations', options => {
  return JF.collections.organizations.find({ removed: false });
});
