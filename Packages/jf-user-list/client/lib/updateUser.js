import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

JF.userlist.updateUser = user => {
  OHIF.ui.showDialog('userInfoModal', user);
};

JF.userlist.callbacks.dblClickOnStudy = JF.userlist.updateUser;
JF.userlist.callbacks.middleClickOnStudy = JF.userlist.updateUser;
