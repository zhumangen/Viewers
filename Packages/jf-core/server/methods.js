import { Meteor } from 'meteor/meteor';
import { Settings } from 'meteor/jf:core/both/collections/settings';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

Meteor.methods({
  storeSettings(privateSettings) {
    JF.validation.checks.checkNonEmptyString(privateSettings.userId);
    const filter = { userId: privateSettings.userId };
    const data = {
      userId: privateSettings.userId,
      private: privateSettings.private
    };
    if (data) {
      Settings.update(filter, data, {upsert: true, multi: false});
      OHIF.log.info('saving private settings.');
    }
  }
})
