import { JF } from 'meteor/jf:core';

/**
 * Extensible method to translate the location and return a string containing its label
 *
 * @param location
 * @returns string - label for the given location
 */
JF.measurements.getLocationLabel = location => {
    return location;
};
