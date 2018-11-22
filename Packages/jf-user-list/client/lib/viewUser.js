import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

JF.userlist.viewUser = user => {
  if (!user) return;


};

JF.userlist.callbacks.dblClickOnStudy = JF.userlist.viewUser;
JF.userlist.callbacks.middleClickOnStudy = JF.userlist.viewUser;
