import { Template } from 'meteor/templating';
import { JF } from 'meteor/jf:core';

Template.registerHelper('systemTitle', () => {
  return JF.managers.settings.systemTitle();
});

Template.registerHelper('systemVersion', () => {
  return JF.managers.settings.systemVersion();
});
