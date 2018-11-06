import { JF } from 'meteor/jf:core';

JF.studylist.retrieveStudies = studyIds => {
  return new Promise((resolve, reject) => {
    Meteor.call('queryStudies', studyIds, {}, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}
