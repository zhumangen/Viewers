import SimpleSchema from 'simpl-schema';
import { MeasurementSchemaTypes } from 'meteor/ohif:measurements/both/schema/measurements';

const CornerstoneHandleSchema = MeasurementSchemaTypes.CornerstoneHandleSchema;

const NonTargetHandlesSchema = new SimpleSchema({
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

const NonTargetSchema = new SimpleSchema({
    handles: {
        type: NonTargetHandlesSchema,
        label: 'Handles'
    },
    response: {
        type: String,
        label: 'Response',
        optional: true // Optional because it is added after initial drawing, via a callback
    },
    location: {
        type: String,
        label: 'Location',
        optional: true
    },
    locationUid: {
        type: String,
        label: 'Location UID',
        optional: true // Optional because it is added after initial drawing, via a callback
    }
});
NonTargetSchema.extend(MeasurementSchemaTypes.CornerstoneToolMeasurement);

const displayFunction = data => data.location;

export const nonTarget = {
    id: 'nonTargets',
    name: 'Non-Targets',
    cornerstoneToolType: 'nonTarget',
    schema: NonTargetSchema,
    displayFunction,
    options: {
        showInMeasurementTable: true,
        measurementTableOptions: {
            displayFunction
        },
        includeInCaseProgress: true,
    }
};
