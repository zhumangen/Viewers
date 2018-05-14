import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const TbRecordSchema = new SimpleSchema([{
    tb: {
        type: Boolean,
        label: "Is Tuberculosis"
    },
    score: {
        type: Number,
        label: "Tuberculosis Score"
    },
    userId: {
        type: String,
        label: "User ID"
    },
    userName: {
        type: String,
        label: "User Name",
        optional: true
    },
    lastModified: {
        type: Date
    }
}]);

export const TbRatingSchema = new SimpleSchema({
    serverId: {
        type: String,
        label: "Server ID",
    },
    studyUid: {
        type: String,
        label: "Study UID",
    },
    seriesUid: {
        type: String,
        label: "Series UID"
    },
    imageUid: {
        type: String,
        label: "Image UID"
    },
    tbRecords: {
        type: TbRecordSchema,
        label: "TB Records"
    }
});
