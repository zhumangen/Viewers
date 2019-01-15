import { JF } from 'meteor/jf:core';
import { Template } from 'meteor/templating';

const UserPromises = new Map();

JF.user.getUser = userId => {
  if (UserPromises.has(userId)) {
    return UserPromises.get(userId);
  }

  const promise = new Promise((resolve, reject) => {
    const Users = JF.user.users;
    const user = Users.findOne({ _id: userId });
    if (user) {
      resolve(user);
    } else {
      Meteor.call('getUser', userId, (error, user) => {
        if (error) {
          reject(error);
        } else {
          if (user) {
            Users.insert(user);
          } else {
            reject(new Meteor.Error('User not found: ' + userId));
          }
          resolve(user);
        }
      });
    }
  });

  UserPromises.set(userId, promise);
  return promise;
}

JF.user.getUserName = userId => {
  return new Promise((resolve, reject) => {
    JF.user.getUser(userId).then(user => {
      if (user) {
        resolve(user.profile.fullName);
      }
      resolve('');
    });
  });
}

JF.user.getUserNameSync = userId => {
  if (!userId) return '';

  const Users = JF.user.users;
  const user = Users.findOne({ _id: userId });
  if (user) {
    return user.profile.fullName;
  } else {
    JF.user.getUserName(userId);
  }

  return '';
}

Template.registerHelper('getUserName', userId => JF.user.getUserNameSync(userId));
