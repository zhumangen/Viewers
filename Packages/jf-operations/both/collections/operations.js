import { Mongo } from 'meteor/mongo';
import { JF } from 'meteor/jf:core';

const Operations = new Mongo.Collection('operations', { idGeneration: 'MONGO'});
JF.collections.operations = Operations;

export { Operations }
