import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';

Meteor.startup(() => {
  Router.route('/import', function() {
    this.render('app', { data: { template: 'importDicom' }});
  }, { name: 'importDicom' });
})
