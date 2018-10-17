import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Template.orderlistView.onCreated(() => {
  const instance = Template.instance();
  instance.autorun(() => {
    Meteor.subscribe('orders');
  });
})
