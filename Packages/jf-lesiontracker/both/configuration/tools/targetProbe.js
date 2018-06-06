import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { MeasurementSchemaTypes } from 'meteor/jf:measurements/both/schema/measurements';

const CornerstoneHandleSchema = MeasurementSchemaTypes.CornerstoneHandleSchema;

const TargetProbeHandlesSchema = new SimpleSchema({
    end: {
        type: CornerstoneHandleSchema,
        label: 'End'
    },
    textBox: {
        type: CornerstoneHandleSchema,
        label: 'Text Box'
    }
});

const TargetProbeSchema = new SimpleSchema([MeasurementSchemaTypes.CornerstoneToolMeasurement, {
    handles: {
        type: TargetProbeHandlesSchema,
        label: 'Handles'
    },
    measurementNumber: {
        type: Number,
        label: 'Measurement Number'
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
    }
}]);

export const targetProbe = {
    id: 'targetProbe',
    name: 'Probe Target',
    toolGroup: 'targets',
    cornerstoneToolType: 'targetProbe',
    schema: TargetProbeSchema,
    options: {
        measurementTable: {
            displayFunction: data => data.value
        },
        caseProgress: {
            include: true
        }
    }
};
