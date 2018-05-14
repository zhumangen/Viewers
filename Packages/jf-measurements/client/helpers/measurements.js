import { Template } from 'meteor/templating';

import { JF } from 'meteor/jf:core';

// Get the current measurement API configuration with information about tools, data exchange
// and data validation.
Template.registerHelper('measurementConfiguration', () => {
    return JF.measurements.MeasurementApi.getConfiguration();
});

// Translates the location and return a string containing its label
Template.registerHelper('getLocationLabel', label => {
    return JF.measurements.getLocationLabel(label);
});
