import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

JF.organizationlist.viewOrganization = organization => {
  if (!organization) return;


};

JF.organizationlist.callbacks.dblClickOnStudy = JF.organizationlist.viewOrganization;
JF.organizationlist.callbacks.middleClickOnStudy = JF.organizationlist.viewOrganization;
