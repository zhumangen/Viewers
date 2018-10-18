import { measurementTools } from './measurementTools';
import { OHIF } from 'meteor/ohif:core';
import { HTTP } from 'meteor/http';

// const apiHost = 'http://101.132.45.197:8685';
const apiHost = 'http://47.100.41.69:9090';

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

export const retrieveUserName = options => {
    OHIF.log.info('retrieveUserName');

    return new Promise((resolve, reject) => {
        Meteor.call('retrieveUserName', options, (error, response) => {
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
                resolve(measurementData);
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

export const submitMeasurements = (options, measurementData) => {
    OHIF.log.info('Submit measurement data to main server.');

    return new Promise((resolve, reject) => {
        let headers = { token: options.token, version: options.version };
        let data = { jsonValue: measurementData, labelAccnum: options.labelAccnum };
        // console.log('measurementData length: ', JSON.stringify(measurementData).length);
        HTTP.call('POST', apiHost+'/v2/rmis/sysop/labelJson', { headers, data }, (error, result) => {
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
        HTTP.call('POST', apiHost+'/v2/rmis/sysop/dictDtl/one', { headers, data }, (error, result) => {
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
        let api = apiHost+'/v2/rmis/sysop/labelInfolist/';
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
        HTTP.call('GET', apiHost+'/v2/rmis/sysop/sysoperator/', { headers }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                if (result.data.code === 200) {
                    let user = {};
                    const sysOper = result.data.data.sysOperator;
                    user.userId = sysOper.id;
                    user.userName = sysOper.name;
                    user.permission = 0;
                    if (sysOper.adminCode === '3706') {
                        user.permission = 1;
                    }if (sysOper.adminCode === '3705') {
                        user.permission = 2;
                    }if (sysOper.adminCode === '3704') {
                        user.permission = 3;
                    }if (sysOper.adminCode === '3703') {
                        user.permission = 4;
                    }
                    resolve(user);
                } else {
                    reject(result.data);
                }
            }
        });
    });
}
