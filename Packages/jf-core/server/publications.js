import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { Settings, CollectionName } from 'meteor/jf:core/both/collections/settings';

Meteor.publish(CollectionName, function() {
  const userId = this.userId;
  const filter = { $or: [{ userId: '_system_' }]};
  if (userId) {
    filter.$or.push({ userId });
  }
  return Settings.find(filter);
});
