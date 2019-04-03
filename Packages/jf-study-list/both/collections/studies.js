import { Mongo } from 'meteor/mongo';
import { JF } from 'meteor/jf:core';

const Studies = new Mongo.Collection('studies');
Studies._debugName = 'Studies';
JF.collections.studies = Studies;

const StudiesCount = new Mongo.Collection('studies_count');
StudiesCount._debugName = 'StudiesCount';
JF.collections.studiesCount = StudiesCount;

export { Studies, StudiesCount };
