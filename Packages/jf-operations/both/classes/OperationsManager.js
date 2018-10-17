import { Meteor } from 'meteor/meteor';
import { OHIF } from 'meteor/ohif:core';

export class OperationsManager {
  constuctor() {

  }

  retrieve(options) {
    OHIF.log.info('retrieving operations...');
    retrun new Promise((resolve, reject) => {
      Meteor.call('retriveOperations', options, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    })
  }

  store(options) {
    OHIF.log.info('storing operations...');
    return new Promise((resolve, reject) => {
      Meteor.call('storeOperations', options, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    })
  }
}
