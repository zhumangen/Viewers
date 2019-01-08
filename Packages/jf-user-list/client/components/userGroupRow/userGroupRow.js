import { JF } from 'meteor/jf:core';

Template.userGroupRow.onCreated(() => {
  console.log(Template.instance().data);
});

Template.userGroupRow.onRendered(() => {
  const instance = Template.instance();

  instance.data.$form = instance.$('form').first();
  instance.data.form = instance.data.$form.data('component');

  instance.data.form.value(instance.data.group);
});

Template.userGroupRow.events({
  'click input[type=checkbox]'(event, instance) {
    Object.assign(instance.data.group, instance.data.form.value());
  }
});
