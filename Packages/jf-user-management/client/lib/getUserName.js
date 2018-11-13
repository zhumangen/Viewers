import { JF } from 'meteor/jf:core';
import { Template } from 'meteor/templating';

const UserPromises = new Map();

JF.user.getUserName = userId => {
  if (UserPromises.has(userId)) {
    return UserPromises.get(userId);
  }

  const promise = new Promise((resolve, reject) => {
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

  UserPromises.set(userId, promise);
  return promise;
}

JF.user.getUserNameSync = userId => {
  if (!userId) return '';

  const Users = JF.user.users;
  const user = Users.findOne({ _id: userId });
  if (user) {
    return user.userName;
  } else {
    JF.user.getUserName(userId);
  }

  return '';
}

Template.registerHelper('getUserName', userId => JF.user.getUserNameSync(userId));
