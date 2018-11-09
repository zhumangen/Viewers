import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';
import { measurementTools } from 'meteor/jf:lesiontracker/both/configuration/measurementTools';

// server side use only
export default function updateMeasurementStatus(orderId, status) {
  JF.validation.checks.checkNonNegativeNumber(status);
  if (!orderId) return;

  const Measurements = JF.collections.measurements;
  measurementTools.forEach(tool => {
    Measurements[tool.id].update({ orderId }, { $set: { status }}, { multi: true }, OHIF.MongoUtils.writeCallback);
  });
}
