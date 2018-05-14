import { measurementTools } from './measurementTools';
import { OHIF } from 'meteor/ohif:core';
import { HTTP } from 'meteor/http';

export const retrieveMeasurements = (options) => {
    OHIF.log.info('retrieveMeasurements');

    return new Promise((resolve, reject) => {
        Meteor.call('retrieveMeasurements', options, (error, response) => {
            if (error) {
                reject(error);
            } else {
                console.log(response);

                /*measurementTools.forEach(tool => {
                    console.log('Retrieving tool: ' + tool.id);
                });*/

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
                resolve(measurementData);
            }
        });
    });
};

export const submitMeasurements = (options, measurementData) => {
    OHIF.log.info('Submit measurement data to main server.');
    
    return new Promise((resolve, reject) => {
        let headers = { token: options.token, version: options.version };
        let data = { jsonValue: measurementData };
        HTTP.call('POST', 'http://192.168.10.50:8080/v2/rmis/sysop/labelJson', { headers, data }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                if (result.data.code === 200) {
                    resolve(result.data);
                } else {
                    reject(result.data);
                }
            }
        });
    });
};

export const retrieveLesions = (options) => {
    OHIF.log.info('Retrieving Lesions from the Server');

    return new Promise((resolve, reject) => {
        let headers = { token: options.token, version: options.version };
        let data = { othervalue2: 'CHEST' };
        HTTP.call('POST', 'http://192.168.10.50:8080/v2/rmis/sysop/dictDtl/one', { headers, data }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                if (result.data.code === 200) {
                    let lesions = [];
                    result.data.data.forEach( ele => {
                        lesions.push(ele.othervalue);
                    });
                    resolve(lesions);
                } else {
                    reject(result.data);
                }
            }
        });
    });
};

export const submitResult = (options) => {
    OHIF.log.info('Submit result to main server');

    return new Promise((resolve, reject) => {
        let api = 'http://192.168.10.50:8080/v2/rmis/sysop/labelInfolist/';
        api += options.labelAccnum + '/' + options.actionCode;
        let headers = { token: options.token, version: options.version };
        HTTP.call('POST', api, { headers }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                if (result.data.code === 200) {
                    resolve(result.data);
                } else {
                    reject(result.data);
                }
            }
        });
    });
};

export const queryUserInfo = (options) => {
    OHIF.log.info('Query user info from main server');

    return new Promise((resolve, reject) => {
        let headers = { token: options.token, version: options.version };
        HTTP.call('GET', 'http://192.168.10.50:8080/v2/rmis/sysop/sysoperator/', { headers }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                if (result.data.code === 200) {
                    let user = {};
                    const sysOper = result.data.data.sysOperator;
                    user.userId = sysOper.id;
                    user.userName = sysOper.name;
                    user.reviewer = 0;
                    if (sysOper.adminCode === '3703' || sysOper.adminCode === '3704' || sysOper.adminCode === '3705') {
                        user.reviewer = 1;
                    }
                    resolve(user);
                } else {
                    reject(result.data);
                }
            }
        });
    });
}
