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

export const submitOrder = (orderId, options) => {
    OHIF.log.info('submit order.');

    return new Promise((resolve, reject) => {
        Meteor.call('endOrder', orderId, options, (error, result) => {
            if (error) {
                OHIF.log.error(error);
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};
