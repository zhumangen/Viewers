import SimpleSchema from 'simpl-schema';
import { MeasurementSchemaTypes } from 'meteor/ohif:measurements/both/schema/measurements';

const CornerstoneHandleSchema = MeasurementSchemaTypes.CornerstoneHandleSchema;

const EllipseHandlesSchema = new SimpleSchema({
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

const EllipseSchema = new SimpleSchema({
    handles: {
        type: EllipseHandlesSchema,
        label: 'Handles'
    }
});

EllipseSchema.extend(MeasurementSchemaTypes.CornerstoneToolMeasurement._schema);

export const ellipse = {
    id: 'ellipse',
    name: 'Ellipse',
    toolGroup: 'temp',
    cornerstoneToolType: 'ellipticalRoi',
    schema: EllipseSchema
};
