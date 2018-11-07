import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

JF.user.login = params => {
    return new Promise((resolve, reject) => {
        Meteor.loginWithPassword(params.username, params.password, error => {
            if (error) {
                return reject(error);
            }

            resolve();
        });
    });
};
