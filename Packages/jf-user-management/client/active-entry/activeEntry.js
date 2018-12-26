import { Meteor } from 'meteor/meteor';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';

Meteor.startup(function() {
  const config = {
    logo: {
      url: OHIF.utils.absoluteUrl('/images/logo.png'),
      displayed: true
    },
    signIn: {
      displayFullName: true,
      destination: '/'
    },
    signUp: {
      destination: '/'
    },
    themeColors: {
      primary: ''
    }
  };

  JF.managers.settings.passwordOptions().then(options => {
    config.passwordOptions = options;
    JF.activeEntry.configure(config);
  });
});
