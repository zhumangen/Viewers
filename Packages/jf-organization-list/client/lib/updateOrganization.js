import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

JF.organizationlist.updateOrganization = organization => {
  OHIF.ui.showDialog('orgInfoModal', { organization });
};

JF.organizationlist.callbacks.dblClickOnStudy = JF.organizationlist.updateOrganization;
JF.organizationlist.callbacks.middleClickOnStudy = JF.organizationlist.updateOrganization;
