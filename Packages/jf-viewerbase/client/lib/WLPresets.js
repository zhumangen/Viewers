import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.startup(() => {
    JF.managers.wlPresets.loadDefaults();
    JF.managers.wlPresets.load();
});
