import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';

Meteor.startup(() => {
  Router.route('/organizationlist', function() {
    this.render('app', { data: { template: 'organizationlist' }});
  }, { name: 'organizationlist' });
})
