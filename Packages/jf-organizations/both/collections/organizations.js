import { Mongo } from 'meteor/mongo';
import { JF } from 'meteor/jf:core';

const Organizations = new Mongo.Collection('organizations');
JF.collections.organizations = Organizations;

export { Organizations }
