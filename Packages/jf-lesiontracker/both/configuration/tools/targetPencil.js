import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { MeasurementSchemaTypes } from 'meteor/jf:measurements/both/schema/measurements';

const CornerstoneHandleSchema = MeasurementSchemaTypes.CornerstoneHandleSchema;

const TargetPencilHandlesSchema = new SimpleSchema({
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

const TargetPencilSchema = new SimpleSchema([MeasurementSchemaTypes.CornerstoneToolMeasurement, {
    handles: {
        type: TargetPencilHandlesSchema,
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
    },
    isSplitLesion: {
        type: Boolean,
        label: 'Is Split Lesion',
        optional: true,
        defaultValue: false
    }
}]);

const displayFunction = data => {
    if (data.shortestDiameter) {
        // TODO: Make this check criteria again to see if we should display shortest x longest
        return data.longestDiameter + ' x ' + data.shortestDiameter;
    }

    return data.longestDiameter;
};

export const targetPencil = {
    id: 'targetPencil',
    name: 'Pencil Target',
    toolGroup: 'targets',
    cornerstoneToolType: 'targetPencil',
    schema: TargetPencilSchema,
    options: {
        measurementTable: {
            displayFunction
        },
        caseProgress: {
            include: true,
            nonTarget: false,
            toggleVisibility: true
        }
    }
};
