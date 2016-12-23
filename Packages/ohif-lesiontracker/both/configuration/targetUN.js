import SimpleSchema from 'simpl-schema';
import { MeasurementSchemaTypes } from 'meteor/ohif:measurements/both/schema/measurements';

const CornerstoneHandleSchema = MeasurementSchemaTypes.CornerstoneHandleSchema;

const TargetUNHandlesSchema = new SimpleSchema({
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

const TargetUNSchema = new SimpleSchema({
    viewerTool: {
        type: String,
        label: 'Viewer Tool',
        defaultValue: 'targetsUN',
        optional: true
    },
    handles: {
        type: TargetUNHandlesSchema,
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
TargetUNSchema.extend(MeasurementSchemaTypes.CornerstoneToolMeasurement);

export const targetUN = {
    id: 'targetsUN',
    memberOf: 'targets',
    name: 'UN Targets',
    cornerstoneToolType: 'targetUN',
    schema: TargetUNSchema,
    displayFunction: data => data.location,
    options: {
        includeInCaseProgress: true,
    }
};
