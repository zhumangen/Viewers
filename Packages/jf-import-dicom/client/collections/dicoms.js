import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.startup(() => {
  const ImportDicoms = new Meteor.Collection(null);
  ImportDicoms._debugName = 'ImportDicoms';
  JF.collections.importDicoms = ImportDicoms;

  const SelectStatus = new Meteor.Collection(null);
  SelectStatus._debugName = 'ImportDicomsSelectStatus';
  JF.dicomlist.selectStatus = SelectStatus;
})
