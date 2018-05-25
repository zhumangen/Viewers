import { JF } from 'meteor/jf:core';

import { measurementTools } from './measurementTools';
import { retrieveMeasurements, storeMeasurements, changeStatus, retrieveLesions, submitResult, submitMeasurements, queryUserInfo } from './dataExchange';
import { validateMeasurements } from './dataValidation';
import { FieldLesionLocation, FieldLesionLocationResponse } from 'meteor/jf:lesiontracker/both/schema/fields';

JF.measurements.MeasurementApi.setConfiguration({
    measurementTools,
    newLesions: [{
        id: 'newTargets',
        name: 'New Targets',
        toolGroupId: 'targets'
    }, {
        id: 'newNonTargets',
        name: 'New Non-Targets',
        toolGroupId: 'nonTargets'
    }],
    dataExchange: {
        retrieve: retrieveMeasurements,
        store: storeMeasurements,
        changeStatus,
        retrieveLesions,
        submitResult,
        submitMeasurements,
        queryUserInfo
    },
    dataValidation: {
        validation: validateMeasurements
    },
    schema: {
        nonTargetLocation: FieldLesionLocation,
        nonTargetResponse: FieldLesionLocationResponse
    }
});
