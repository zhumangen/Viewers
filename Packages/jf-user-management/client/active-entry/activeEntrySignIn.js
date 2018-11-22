import { Template } from 'meteor/templating';
import { JF } from 'meteor/jf:core';

Template.entrySignIn.hooks({
    rendered: function () {
        if (!Meteor.settings.public.demoUserEnabled) {
            return;
        }

        // Create Test Drive button dynamically
        let btnTestDrive = $('<button/>', {
            id: 'btnTestDrive',
            text: 'Test Drive',
            class: 'btn btn-primary',
            style: 'position: absolute; width: 150px; top: 20px; right: 20px; padding-left: 0;',
            title: 'Login with Demo User',
            click: function () {
                // Login with demo user
                JF.activeEntry.signIn('demo@ohif.org', '12345678aA*');
            }
        });

        const entrySignIn = this.find('#entrySignIn');
        $(entrySignIn).append(btnTestDrive);
    }
});
