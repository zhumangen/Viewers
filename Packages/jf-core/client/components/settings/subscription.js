import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';
import { CollectionName as SettingsName } from 'meteor/jf:core/both/collections/settings';

Meteor.startup(() => {
  Meteor.subscribe(SettingsName);
});
