import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.startup(() => {
  const ImportDicoms = new Meteor.Collection(null);
  ImportDicoms._debugName = 'ImportDicoms';

  JF.collections.importDicoms = ImportDicoms;
})
