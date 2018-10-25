import { Mongo } from 'meteor/mongo';
import { JF } from 'meteor/jf:core';

const Studies = new Mongo.Collection('studies');
Studies._debugName = 'Studies';
JF.collections.studies = Studies;

export { Studies };
