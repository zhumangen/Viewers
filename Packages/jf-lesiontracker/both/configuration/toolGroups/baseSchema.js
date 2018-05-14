import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const ToolGroupBaseSchema = new SimpleSchema({
    toolId: {
        type: String,
        label: 'Tool ID',
        optional: true
    },
    toolItemId: {
        type: String,
        label: 'Tool Item ID',
        optional: true
    },
    createdAt: {
        type: Date
    },
    measurementNumber: {
        type: Number,
        label: 'Measurement Number'
    }
});
