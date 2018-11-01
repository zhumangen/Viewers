import { JF } from 'meteor/jf:core';

JF.dicomlist.importSelectedDicoms = () => {
  JF.dicomlist.importDicomsProgress(JF.dicomlist.getSelectedDicoms());
}
