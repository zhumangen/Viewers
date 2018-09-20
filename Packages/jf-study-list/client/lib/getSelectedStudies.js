import { JF } from 'meteor/jf:core';

JF.studylist.getSelectedStudies = () => {
    return JF.studylist.collections.Studies.find({ selected: true }, {
        sort: {
            studyDate: 1
        }
    }).fetch() || [];
};
