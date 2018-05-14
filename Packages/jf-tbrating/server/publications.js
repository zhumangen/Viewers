import { Meteor } from 'meteor/meteor';
import { TbRatings } from 'meteor/jf:tbrating/both/collections';

Meteor.publish('tbratings', (userId) => {
    const qry = {
      'results.userId': userId
    };
    return TbRatings.find({}, {fields: { 'requestOptions.headers':0 }});
})