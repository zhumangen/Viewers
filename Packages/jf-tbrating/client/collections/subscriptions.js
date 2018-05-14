import { Meteor } from 'meteor/meteor';

Meteor.subscribe('tbratings', { userId: Meteor.userId() });