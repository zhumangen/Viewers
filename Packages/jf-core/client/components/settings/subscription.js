import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';
import { CollectionName as SettingsName } from 'meteor/jf:core/both/collections/settings';

Meteor.startup(() => {
  Tracker.autorun(() => {
    const user = Session.get('userInfo');
    Meteor.subscribe(SettingsName, user&&user.userId?user.userId:'');
  });
});
