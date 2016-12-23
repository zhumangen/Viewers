import SimpleSchema from 'simpl-schema';
import { MeasurementSchemaTypes } from 'meteor/ohif:measurements/both/schema/measurements';

const CornerstoneHandleSchema = MeasurementSchemaTypes.CornerstoneHandleSchema;

const TargetCRHandlesSchema = new SimpleSchema({
    start: {
        type: CornerstoneHandleSchema,
        label: 'Start'
    },
    end: {
        type: CornerstoneHandleSchema,
        label: 'End'
    },
    textBox: {
        type: CornerstoneHandleSchema,
        label: 'Text Box'
    }
});

const TargetCRSchema = new SimpleSchema({
    viewerTool: {
        type: String,
        label: 'Viewer Tool',
        defaultValue: 'targetsCR',
        optional: true
    },
    handles: {
        type: TargetCRHandlesSchema,
        label: 'Handles'
    },
    location: {
        type: String,
        label: 'Location',
        optional: true
    },
    description: {
        type: String,
        label: 'Description',
        optional: true
    },
    locationUid: {
        type: String,
        label: 'Location UID',
        optional: true // Optional because it is added after initial drawing, via a callback
    }
});
TargetCRSchema.extend(MeasurementSchemaTypes.CornerstoneToolMeasurement);

export const targetCR = {
    id: 'targetsCR',
    memberOf: 'targets',
    name: 'CR Targets',
    cornerstoneToolType: 'targetCR',
    schema: TargetCRSchema,
    displayFunction: data => data.location,
    options: {
        includeInCaseProgress: true,
    }
};
