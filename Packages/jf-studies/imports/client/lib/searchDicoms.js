import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

const dicomsSearchPromises = new Map();

/**
 * Search for studies information by the given filter
 *
 * @param {Object} filter Filter that will be used on search
 * @returns {Promise} resolved with an array of dicoms information or rejected with an error
 */
JF.studies.searchDicoms = (serverId, level, filter) => {
    const promiseKey = JSON.stringify(filter);
    if (dicomsSearchPromises.has(promiseKey)) {
        return dicomsSearchPromises.get(promiseKey);
    } else {
        const promise = new Promise((resolve, reject) => {
            Meteor.call('DicomListSearch', serverId, level, filter, (error, dicomsData) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(dicomsData);
                }
            });
        });
        dicomsSearchPromises.set(promiseKey, promise);
        return promise;
    }
};
