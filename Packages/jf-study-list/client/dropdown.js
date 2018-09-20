import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

Meteor.startup(() => {
    JF.studylist.dropdown = new OHIF.ui.Dropdown();

    JF.studylist.dropdown.setItems([{
        action: JF.studylist.viewSeriesDetails,
        text: 'View Series Details'
    }, {
        text: 'Anonymize',
        disabled: true
    }, {
        text: 'Send',
        disabled: true,
        separatorAfter: true
    }, {
        text: 'Delete',
        disabled: true
    }, {
        action: JF.studylist.exportSelectedStudies,
        text: 'Export',
        title: 'Export Selected Studies'
    }]);
});
