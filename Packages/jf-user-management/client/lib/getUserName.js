import { JF } from 'meteor/jf:core';
import { Template } from 'meteor/templating';

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

JF.user.getUserNameSync = userId => {
  const Users = JF.user.users;
  const user = Users.findOne({ _id: userId });
  return user && user.userName;
}

Template.registerHelper('getUserName', userId => JF.user.getUserNameSync(userId));
