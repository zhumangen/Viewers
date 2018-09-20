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
    storeMeasurements(measurementData, options) {
        OHIF.log.info('Storing Measurements on the Server');
        OHIF.log.info(JSON.stringify(measurementData, null, 2));

        check(options, Match.Where(arg => {
            check(arg.userId, JF.validation.NonEmptyString);
            check(arg.studyInstanceUid, JF.validation.NonEmptyString);
            check(arg.seriesInstanceUids, JF.validation.NonEmptyStringArray);
            return true;
        }));

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
        check(options, Match.Where(arg => {
            check(arg.userId, JF.validation.NonEmptyString);
            check(arg.studyInstanceUid, JF.validation.NonEmptyString);
            check(arg.seriesInstanceUids, JF.validation.NonEmptyStringArray);
            check(arg.status, JF.validation.PositiveNumber);
            return true;
        }));

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

        check(options, Match.Where(arg => {
            check(arg.userId, JF.validation.NonEmptyString);
            check(arg.studyInstanceUid, JF.validation.NonEmptyString);
            check(arg.seriesInstanceUids, JF.validation.NonEmptyStringArray);
            check(arg.statusCode, JF.validation.NonEmptyString);
            check(arg.permission, JF.validation.NonNegativeNumber);
            return true;
        }));

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

    retrieveUserName(options) {
        OHIF.log.info('Retrieving user name');

        check(options, Match.Where(arg => {
            check(arg.studyInstanceUid, JF.validation.NonEmptyString);
            check(arg.seriesInstanceUids, JF.validation.NonEmptyStringArray);
            check(arg.status, JF.validation.NonNegativeNumber);
            return true;
        }));

        let userName;
        const filter = {
            studyInstanceUid: options.studyInstanceUid,
            status: options.status
        }
        filter.$or = [];
        options.seriesInstanceUids.forEach(seriesInstanceUid => filter.$or.push({seriesInstanceUid}));

        let measurements = [];
        measurementTools.forEach(tool => {
            measurements = measurements.concat(MeasurementCollections[tool.id].find(filter).fetch());
        });

        if (measurements.length > 0) {
            userName = measurements[0].userName;
        }

        return userName;
    },

    retrieveLesions(options) {
        OHIF.log.info('Retrieving Lesions from the Server');

        check(options, Match.Where(arg => {
            check(arg.token, JF.validation.NonEmptyString);
            check(arg.version, JF.validation.NonEmptyString);
            return true;
        }));

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
