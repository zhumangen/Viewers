import { JF } from 'meteor/jf:core';
import { ReactiveVar } from 'meteor/reactive-var';
import { OHIF } from 'meteor/ohif:core';
import { _ } from 'meteor/underscore';

Template.orgInfoModal.onCreated(() => {

});

Template.orgInfoModal.onRendered(() => {
  const instance = Template.instance();

  instance.data.$form = instance.$('form').first();
  instance.data.form = instance.data.$form.data('component');

  instance.data.form.value(instance.data);
});
