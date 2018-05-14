import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';
import { HTTP } from 'meteor/http';
import { measurementTools } from 'meteor/jf:lesiontracker/both/configuration/measurementTools';

let MeasurementCollections = {};
measurementTools.forEach(tool => {
    MeasurementCollections[tool.id] = new Mongo.Collection(tool.id);
    MeasurementCollections[tool.id]._debugName = tool.id;
});

// TODO: Make storage use update instead of clearing the entire collection and
// re-inserting everything.
Meteor.methods({
    storeMeasurements(measurementData, filter) {
        OHIF.log.info('Storing Measurements on the Server');
        OHIF.log.info(JSON.stringify(measurementData, null, 2));
        
        if (!filter || !filter.userId || filter.userId == '') return;

        Object.keys(measurementData).forEach(toolId => {
            if (!MeasurementCollections[toolId]) {
                return;
            }

            MeasurementCollections[toolId].remove(filter);

            const measurements = measurementData[toolId];
            measurements.forEach(measurement => {
                MeasurementCollections[toolId].insert(measurement);
            });
        });
    },

    retrieveMeasurements(options) {
        OHIF.log.info('Retrieving Measurements from the Server');
        OHIF.log.info(JSON.stringify(options, null, 2));
        let measurementData = {};

        const filter = {};
        if (options) {
            if (options.studyInstanceUid && options.studyInstanceUid.length > 0) {
                filter.studyInstanceUid = options.studyInstanceUid;
            }
            if (options.seriesInstanceUids && options.seriesInstanceUids.length > 0) {
                filter['$or'] = [];
                options.seriesInstanceUids.forEach( (seriesInstanceUid) => {
                    filter['$or'].push({ seriesInstanceUid });
                });
            }
            if (options.userId && options.userId != '') {
                filter.userId = options.userId;
                
                let count = 0;
                measurementTools.forEach(tool => {
                    measurementData[tool.id] = MeasurementCollections[tool.id].find(filter).fetch();
                    count += measurementData[tool.id].length;
                });
                
                if (count === 0 && options.reviewer > 0) {
                    delete filter.userId;
                    measurementTools.forEach(tool => {
                        measurementData[tool.id] = MeasurementCollections[tool.id].find(filter).fetch();
                    });
                }
            }
        }

        return measurementData;
    },
    
    retrieveLesions(options) {
        OHIF.log.info('Retrieving Lesions from the Server');

        let lesions = [];
        let headers = { token: options.token, version: options.version };
        let data = { othervalue2: 'CHEST' };
        try {
            result = HTTP.call('POST', 'http://172.16.86.145/v2/rmis/sysop/dictDtl/one', { headers, data });
            OHIF.log.info('Retrieved Lesions: ', result.data.data);
            result.data.data.forEach( ele => {
                lesions.push(ele.othervalue);
            });
        } catch (error) {
            OHIF.log.info('Retrieving lesions error: ', error);
        }
        
        return lesions;
    },
    
    postMeasurements(measurementData, token) {
        OHIF.log.info('Posting Measurements to other Server');
    }
});
