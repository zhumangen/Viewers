import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { OHIF } from 'meteor/ohif:core';

OHIF.measurements.getLocation = collection => {
    for (let i = 0; i < collection.length; i++) {
        if (collection[i].location) {
            return collection[i].location;
        }
    }
};



Template.measurementTableView.helpers({
    getNewMeasurementType(tool) {
        // TODO: Check Conformance criteria here.
        // RECIST should be nonTargets, irRC should be targets
        return {
            id: 'nonTargets',
            cornerstoneToolType: 'nonTarget',
            name: tool.name
        };
    },

    groupByMeasurementNumber(measurementType, newMeasurementType) {
        const instance = Template.instance();
        const measurementApi = instance.data.measurementApi;
        const timepointApi = instance.data.timepointApi;
        const baseline = timepointApi.baseline();
        if (!measurementApi || !timepointApi || !baseline) {
            return;
        }

        const measurementTypeId = measurementType.id;

        let data;
        let groupObject;
        
        // If this is the type of tool that is separated into New Measurements,
        // then we should only display data here that is not 'New'
        if (measurementTypeId === newMeasurementType.id) {
            // Retrieve all the data for this Measurement type (e.g. 'targets')
            // which was recorded at baseline.
            const atBaseline = measurementApi.fetch(measurementTypeId, {
                timepointId: baseline.timepointId
            });

            // Obtain a list of the Measurement Numbers from the
            // measurements which have baseline data
            const numbers = atBaseline.map(m => m.measurementNumber);

            // Retrieve all the data for this Measurement type which
            // match the Measurement Numbers obtained above
            data = measurementApi.fetch(measurementTypeId, {
                measurementNumber: {
                    $in: numbers
                }
            });

            // Group the Measurements by Measurement Number
            groupObject = _.groupBy(data, entry => entry.measurementNumber);
        } else {
            // If this tool's data is not separated into the New Measurements section
            // then we should just display all of the data.
            data = measurementApi.fetch(measurementTypeId);

            // Group the Measurements by Measurement Number
            groupObject = _.groupBy(data, entry => entry.measurementNumber);
        }

        // Reformat the data for display in the table
        return Object.keys(groupObject).map(key => {
            const anEntry = groupObject[key][0];

            return {
                measurementTypeId: measurementTypeId,
                measurementNumber: key,
                measurementNumberOverall: anEntry.measurementNumberOverall,
                location: OHIF.measurements.getLocation(groupObject[key]),
                responseStatus: false, // TODO: Get the latest timepoint and determine the response status
                entries: groupObject[key]
            };
        });
    },

    newMeasurements(newMeasurementType) {
        const instance = Template.instance();
        const measurementApi = instance.data.measurementApi;
        const timepointApi = instance.data.timepointApi;
        const current = instance.data.timepointApi.current();
        const baseline = timepointApi.baseline();

        if (!measurementApi || !timepointApi || !current) {
            return;
        }

        // If this is a baseline, stop here since there are no new measurements to display

        if (!current || current.timepointType === 'baseline') {
            OHIF.log.info('Skipping New Measurements section');
            return;
        }

        // Retrieve all the data for this Measurement type (e.g. 'targets')
        // which was recorded at baseline.
        const measurementTypeId = newMeasurementType.id;
        const atBaseline = measurementApi.fetch(measurementTypeId, {
            timepointId: baseline.timepointId
        });

        // Obtain a list of the Measurement Numbers from the
        // measurements which have baseline data
        const numbers = atBaseline.map(m => m.measurementNumber);

        // Retrieve all the data for this Measurement type which
        // do NOT match the Measurement Numbers obtained above
        const data = measurementApi.fetch(measurementTypeId, {
            measurementNumber: {
                $nin: numbers
            }
        });

        // Group the Measurements by Measurement Number
        const groupObject = _.groupBy(data, entry => entry.measurementNumber);

        // Reformat the data for display in the table
        return Object.keys(groupObject).map(key => {
            const anEntry = groupObject[key][0];
            
            return {
                measurementTypeId: measurementTypeId,
                measurementNumber: key,
                measurementNumberOverall: anEntry.measurementNumberOverall,
                location: OHIF.measurements.getLocation(groupObject[key]),
                responseStatus: false, // TODO: Get the latest timepoint and determine the response status
                entries: groupObject[key]
            };
        });
    }
});
