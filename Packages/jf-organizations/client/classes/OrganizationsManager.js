import { Meteor } from 'meteor/meteor';
import { OHIF } from 'meteor/ohif:core';

export class OrganizationsManager {
  constuctor() {

  }

  retrieve(options) {
    OHIF.log.info('retrieving organizations...');
    return new Promise((resolve, reject) => {
      Meteor.call('retriveOrganizations', options, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    })
  }

  store(options) {
    OHIF.log.info('storing organizations...');
    return new Promise((resolve, reject) => {
      Meteor.call('storeOrganizations', options, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    })
  }
}
