import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Meteor.publish('studyImportStatus', () => JF.studylist.collections.StudyImportStatus.find());
