import { JF } from 'meteor/jf:core';

JF.dicomlist.viewSelectedDicoms = () => {
  const dicoms = JF.dicomlist.getSelectedDicoms();
  JF.dicomlist.viewDicoms(dicoms);
}
