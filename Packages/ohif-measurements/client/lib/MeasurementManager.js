import { OHIF } from 'meteor/ohif:core';

class MeasurementManager {

    /**
     * Returns new measurement number given a timepointId
     */
    static getNewMeasurementNumber(timepointId, collection, timepointApi) {
        const timepoint = timepointApi.current();
        const baseline = timepointApi.baseline();

        // Find all Measurement Numbers that already have data at this timepoint
        const dataAtTimepoint = collection.find({timepointId});
        const numbersWithDataAtTimepoint = dataAtTimepoint.map(m => m.measurementNumber);
        const setAtTimepoint = new Set(numbersWithDataAtTimepoint);

        let data;
        if (timepoint.timepointId === baseline.timepointId) {
            // Find all Measurement Numbers that exist for this patient    
            data = collection.find();
        } else {
            // Find all Measurement Numbers that exist for this patient at the prior
            // timepoint
            const prior = timepointApi.prior();
            data = collection.find({timepointId: prior.timepointId});
        }

        const measurementNumbers = data.map(m => m.measurementNumber);
        const setToCheck = new Set(measurementNumbers);

        // Check which Measurement Numbers exist in the identified set, but not in
        // the current timepoint
        const differenceSet = setToCheck.difference(setAtTimepoint);

        // Expand the set into an array
        const differenceArray = [...differenceSet];
        
        // If the array has no length, this must be a New Measurement
        // so it should get a new number. The New Measurement number
        // should be the largest value in the identified set + 1.
        if (!differenceArray.length) {
            const lastNumber = Math.max(...setAtTimepoint);
            return lastNumber + 1;
        }

        // Since there are values in the array, return the first one
        // which the User will now be able to measure.
        return differenceArray[0];
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