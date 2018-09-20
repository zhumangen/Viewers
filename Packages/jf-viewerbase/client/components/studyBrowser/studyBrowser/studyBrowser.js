import { Template } from 'meteor/templating';
import { JF } from 'meteor/jf:core';

Template.studyBrowser.helpers({
    studies() {
        // @TypeSafeStudies
        return JF.viewer.Studies.findAllBy({
            selected: true
        });
    }
});
