import { Meteor } from 'meteor/meteor';
import { Settings, CollectionName } from 'meteor/jf:core/both/collections/settings';

Meteor.publish(CollectionName, userId => {
  check(userId, String);
  const filter = { $or: [{ userId: '_system_' }]};
  if (userId.length > 0) {
    filter.$or.push({userId});
  }
  return Settings.find(filter);
});
