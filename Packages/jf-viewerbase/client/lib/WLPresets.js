import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.startup(() => {
  JF.managers.wlPresets.setStoreFunction(storeWLPresets);
  JF.managers.wlPresets.setRetrieveFunction(retrieveWLPresets);

  JF.managers.wlPresets.loadDefaults();
  JF.managers.wlPresets.load();
});

function storeWLPresets(definitions) {
  return JF.managers.settings.setWLPresets(definitions);
}

function retrieveWLPresets() {
  return JF.managers.settings.wlPresets();
}
