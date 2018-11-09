import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import retrieveMeasurements from './retrieveMeasurements';
import storeMeasurements from './storeMeasurements';
import updateMeasurementStatus from './updateMeasurementStatus';

const methods = {
  retrieveMeasurements,
  storeMeasurements
};

Meteor.methods(methods);
Object.assign(JF.measurements, methods, { updateMeasurementStatus });
