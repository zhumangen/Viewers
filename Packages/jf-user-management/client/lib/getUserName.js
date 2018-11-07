import { JF } from 'meteor/jf:core';

JF.user.getUserName = userId => {
  return new Promise((resolve, reject) => {
    const Users = JF.user.users;
    const user = Users.findOne({ _id: userId });
    if (user) {
      resolve(user.userName);
    } else {
      Meteor.call('getUserName', userId, (error, response) => {
        if (error) {
          reject(error);
        } else {
          Users.insert({ _id: userId, userName: response });
          resolve(response);
        }
      });
    }
  });
}
