import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

Template.organizationlistToolbar.events({
    'click .js-add-org'(event) {
        // create new organization
        JF.organization.storeOrganization({"name":"九峰影像","fullName":"江西中科九峰智慧医疗科技有限公司","type":1})
    }
});
