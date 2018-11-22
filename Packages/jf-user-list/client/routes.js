import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';

Meteor.startup(() => {
  Router.route('/userlist', function() {
    this.render('app', { data: { template: 'userlist' }});
  }, { name: 'userlist' });
})
