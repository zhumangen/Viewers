import { JF } from 'meteor/jf:core';

JF.user.removeUsers = userIds => {
  return new Promise((resolve, reject) => {
    Meteor.call('removeUsers', userIds, (error, response) => {
      if (error) {
        reject(error);
      } else {
        if (response.code === 200) {
          resolve();
        } else {
          reject(new Meteor.Error('code: ' + response.code + ', message: ' + response.message));
        }
      }
    });
  });
};
