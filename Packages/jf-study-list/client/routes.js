import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';

Meteor.startup(() => {
  Router.route('/studylist', function() {
    this.render('app', { data: { template: 'studylist' }});
  }, { name: 'studylist' });
})
