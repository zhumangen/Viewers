import updateStudyStatus from './updateStatus.js';
import applyStudies from './applyStudies.js';
import removeStudies from './removeStudies.js';
import queryStudies from './queryStudies.js';
import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

const methods = {
  updateStudyStatus,
  applyStudies,
  removeStudies,
  queryStudies
};

Object.assign(JF.studylist, methods);
Meteor.methods(methods);
