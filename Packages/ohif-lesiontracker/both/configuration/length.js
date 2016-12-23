import SimpleSchema from 'simpl-schema';
import { MeasurementSchemaTypes } from 'meteor/ohif:measurements/both/schema/measurements';

const CornerstoneHandleSchema = MeasurementSchemaTypes.CornerstoneHandleSchema;

const LengthHandlesSchema = new SimpleSchema({
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
    },
});

const LengthSchema = new SimpleSchema({
    handles: {
        type: LengthHandlesSchema,
        label: 'Handles'
    }
});
LengthSchema.extend(MeasurementSchemaTypes.CornerstoneToolMeasurement);

export const length = {
    id: 'length',
    name: 'Length',
    cornerstoneToolType: 'length',
    schema: LengthSchema
};
