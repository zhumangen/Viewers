import { Mongo } from 'meteor/mongo';
import { JF } from 'meteor/jf:core';

const StudyImportStatus = new Mongo.Collection('studyImportStatus');
StudyImportStatus._debugName = 'StudyImportStatus';
JF.studylist.collections.StudyImportStatus = StudyImportStatus;

export { StudyImportStatus };
