import { Mongo } from 'meteor/mongo';
import { JF } from 'meteor/jf:core';

const Operations = new Mongo.Collection('operations');
JF.collections.operations = Operations;

export { Operations }
