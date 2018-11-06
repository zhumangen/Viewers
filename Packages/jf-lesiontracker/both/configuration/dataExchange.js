import { measurementTools } from './measurementTools';
import { OHIF } from 'meteor/ohif:core';
import { HTTP } from 'meteor/http';
import { JF } from 'meteor/jf:core';

export const retrieveMeasurements = (options) => {
    OHIF.log.info('retrieveMeasurements');

    return new Promise((resolve, reject) => {
        Meteor.call('retrieveMeasurements', options, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        });
    });
};

export const storeMeasurements = (measurementData, filter) => {
    OHIF.log.info('storeMeasurements');

    // Here is where we should do any required data transformation and API calls

    return new Promise((resolve, reject) => {
        Meteor.call('storeMeasurements', measurementData, filter, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        });
    });
};

export const changeStatus = options => {
    OHIF.log.info('changeStatus');

    return new Promise((resolve, reject) => {
        Meteor.call('changeStatus', options, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};
