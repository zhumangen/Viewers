import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

Template.dicomListToolbar.helpers({
  allImported() {
    const instance = Template.instance();
    const total = instance.data.total.get();
    const imported = JF.managers.importDicom.numberOfImported();
    return total === imported;
  }
})

Template.dicomListToolbar.events({
  'click input[id="btnImport"]'(event, instance) {
    JF.dicomlist.loadDicomsProgress(instance.data).then(() => {
      const dicoms = JF.managers.importDicom.unimportedDicoms();
      JF.dicomlist.importDicomsProgress(dicoms);
    });
  }
})
