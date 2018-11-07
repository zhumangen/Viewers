import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

JF.user.logout = () => new Promise((resolve, reject) => {
    Meteor.logout(error => {
        if (error) {
            reject(error);
        }

        resolve();
    });
});
