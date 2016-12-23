import SimpleSchema from 'simpl-schema';

export const schema = new SimpleSchema({
    patientId: {
        type: String,
        label: 'Patient ID',
    },
    timepointId: {
        type: String,
        label: 'Timepoint ID'
    },
    timepointType: {
        type: String,
        label: 'Timepoint Type',
        allowedValues: ['baseline', 'followup'],
        defaultValue: 'baseline',
    },
    studyInstanceUids: {
        type: Array,
        label: 'Study Instance Uids',
        defaultValue: []
    },
    'studyInstanceUids.$': {
        type: String
    },
    earliestDate: {
        type: Date,
        label: 'Earliest Study Date from associated studies',
    },
    latestDate: {
        type: Date,
        label: 'Most recent Study Date from associated studies',
    }
});
