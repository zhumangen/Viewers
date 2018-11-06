import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';
import { HTTP } from 'meteor/http';
import { measurementTools } from 'meteor/jf:lesiontracker/both/configuration/measurementTools';

let MeasurementCollections = {};
measurementTools.forEach(tool => {
    MeasurementCollections[tool.id] = new Mongo.Collection(tool.id, { idGeneration: 'MONGO'});
    MeasurementCollections[tool.id]._debugName = tool.id;
});

// TODO: Make storage use update instead of clearing the entire collection and
// re-inserting everything.
Meteor.methods({
    storeMeasurements(measurementData, options) {
        OHIF.log.info('Storing Measurements on the Server');
        OHIF.log.info(JSON.stringify(measurementData, null, 2));

        const Checks = JF.validation.checks;
        Checks.checkNonEmptyString(options.userId);
        Checks.checkNonEmptyString(options.studyInstanceUid);
        Checks.checkNonEmptyStringArray(options.seriesInstanceUids);

        let filter = {};
        filter.userId = options.userId;
        filter.studyInstanceUid = options.studyInstanceUid;
        filter['$or'] = [];
        options.seriesInstanceUids.forEach(seriesInstanceUid => filter['$or'].push({seriesInstanceUid}));
        filter.status = 0;

        measurementTools.forEach(tool => {
            MeasurementCollections[tool.id].remove(filter);
        });

        Object.keys(measurementData).forEach(toolId => {
            if (!MeasurementCollections[toolId]) {
                return;
            }

            const measurements = measurementData[toolId];
            measurements.forEach(measurement => {
                delete measurement._id;
                MeasurementCollections[toolId].insert(measurement);
            });
        });
    },

    changeStatus(options) {
        const Checks = JF.validation.checks;
        Checks.checkNonEmptyString(options.userId);
        Checks.checkNonEmptyString(options.studyInstanceUid);
        Checks.checkNonEmptyStringArray(options.seriesInstanceUids);
        Checks.checkPositiveNumber(options.status);

        let filter = {};
        filter.studyInstanceUid = options.studyInstanceUid;
        filter['$or'] = [];
        options.seriesInstanceUids.forEach(seriesInstanceUid => filter['$or'].push({seriesInstanceUid}));
        filter.status = options.status;
        measurementTools.forEach(tool => {
            MeasurementCollections[tool.id].remove(filter);
        });

        filter.userId = options.userId;
        filter.status = 0;
        const operator = { $set: {status: options.status } };

        measurementTools.forEach(tool => {
            MeasurementCollections[tool.id].update(filter, operator, { multi: true });
        });
    },

    retrieveMeasurements(options) {
        OHIF.log.info('Retrieving Measurements from the Server');
        OHIF.log.info(JSON.stringify(options, null, 2));
        let measurementData = {};

        return measurementData;

        const Checks = JF.validation.checks;
        Checks.checkNonEmptyString(options.userId);
        Checks.checkNonEmptyString(options.studyInstanceUid);
        Checks.checkNonEmptyStringArray(options.seriesInstanceUids);
        Checks.checkNonEmptyString(options.statusCode);
        Checks.checkNonNegativeNumber(optons.permission);

        let filter = {};
        filter.studyInstanceUid = options.studyInstanceUid;
        filter['$or'] = [];
        options.seriesInstanceUids.forEach(seriesInstanceUid => filter['$or'].push({seriesInstanceUid}));

        if (options.statusCode === '7001' || options.statusCode === '7002' || options.statusCode === '7003') {
            filter.status = 1;
        } else if (options.statusCode === '7004' || options.statusCode === '7005') {
            filter.status = 2;
        }
        if ((options.statusCode === '7001' || options.statusCode === '7002') && options.permission > 0) {
            filter.status = 0;
            filter.userId = options.userId;
        }
        if ((options.statusCode === '7003' || options.statusCode === '7004') && options.permission > 1) {
            let count = 0;
            filter.userId = options.userId;
            filter.status = 0;
            measurementTools.forEach(tool => {
                measurementData[tool.id] = MeasurementCollections[tool.id].find(filter).fetch();
                count += measurementData[tool.id].length;
            });
            if (count === 0) {
                filter.status = 1;
                delete filter.userId;
            } else {
                return measurementData;
            }
        }

        measurementTools.forEach(tool => {
            measurementData[tool.id] = MeasurementCollections[tool.id].find(filter).fetch();
        });

        return measurementData;
    },

    postMeasurements(measurementData, token) {
        OHIF.log.info('Posting Measurements to other Server');
    }
});
