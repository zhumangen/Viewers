import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.publish('studies', options => {
  return JF.collections.studies.find();
});
