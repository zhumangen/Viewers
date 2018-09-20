import { Meteor } from 'meteor/meteor';
import { JF } from '../namespace';
import { TypeSafeCollection } from './lib/classes/TypeSafeCollection';

// Create main Studies collection which will be used across the entire viewer...
const Studies = new TypeSafeCollection();

// Make it publicly available on "JF.viewer" namespace...
JF.viewer.Studies = Studies;

// Create main StudyMetadataList collection which will be used across the entire viewer...
const StudyMetadataList = new TypeSafeCollection();

// Make it publicly available on "JF.viewer" namespace...
JF.viewer.StudyMetadataList = StudyMetadataList;

// Subscriptions...
Meteor.subscribe('studyImportStatus');
