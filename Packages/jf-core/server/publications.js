import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { Settings, CollectionName } from 'meteor/jf:core/both/collections/settings';

Meteor.publish(CollectionName, userId => {
  JF.validation.checks.checkString(userId, String);
  const filter = { $or: [{ userId: '_system_' }]};
  if (userId.length > 0) {
    filter.$or.push({userId});
  }
  return Settings.find(filter);
});
