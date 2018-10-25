import { Meteor } from 'meteor/meteor';

Meteor.methods({
  applyStudies(options) {
    const ids = options.dicomIds;
    ids.forEach(id => {
      console.log('applying id: ' + id);
    })
  }
})
