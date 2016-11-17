import { OHIF } from 'meteor/ohif:core';

class MeasurementManager {

    /**
     * Returns new measurement number given a timepointId
     */
    static getNewMeasurementNumber(timepointId, collection, timepointApi) {
        const timepoint = timepointApi.current();
        const baseline = timepointApi.baseline();

        if (timepoint.timepointId === baseline.timepointId) {
            const numMeasurements = collection.find({timepointId}).count();
            return numMeasurements + 1;
        }

        const dataAtBaseline = collection.find({timepointId: baseline.timepointId});
        const numbersWithDataAtBaseline = dataAtBaseline.map(m => m.measurementNumber);
        const setAtBaseline = new Set(numbersWithDataAtBaseline);

        const dataAtTimepoint = collection.find({timepointId});
        const numbersWithDataAtTimepoint = dataAtTimepoint.map(m => m.measurementNumber);
        const setAtTimepoint = new Set(numbersWithDataAtTimepoint);

        const differenceSet = setAtBaseline.difference(setAtTimepoint);
        const difference = [...differenceSet];
        
        if (!difference.length) {
            // This must be a new lesion, so it should get a new number
            return [...setAtBaseline].length + 1;
        }

        return difference[0];
    }

    /**
     * If the current Measurements Number already exists
     * for any other timepoint, returns lesion locationUID
     * @param measurementData
     * @returns {number} - Measurement location ID
     */
    static getLocationIdIfMeasurementExists(measurementData, collection) {
        const measurement = collection.findOne({
            measurementNumber: measurementData.measurementNumber
        });

        if (!measurement) {
            return;
        }

        return measurement.locationId;
    }

}

OHIF.measurements.MeasurementManager = MeasurementManager;