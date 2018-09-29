import { JF } from 'meteor/jf:core';

import { measurementTools } from './measurementTools';
import { retrieveMeasurements, storeMeasurements, changeStatus } from './dataExchange';
import { validateMeasurements } from './dataValidation';

JF.measurements.MeasurementApi.setConfiguration({
    measurementTools,
    newLesions: [{
        id: 'newTargets',
        name: 'New Targets',
        toolGroupId: 'targets'
    }],
    dataExchange: {
        retrieve: retrieveMeasurements,
        store: storeMeasurements,
        changeStatus
    },
    dataValidation: {
        validation: validateMeasurements
    }
});
