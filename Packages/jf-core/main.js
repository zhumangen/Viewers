import { Meteor } from 'meteor/meteor';

/*
 * Defines the base JF object
 */

const JF = {
    lesiontracker: {},
    measurements: {},
    collections: {},
    managers: {},
    viewer: {},
    ui: {}
};

// Expose the OHIF object to the client if it is on development mode
// @TODO: remove this after applying namespace to this package
if (Meteor.isClient) {
    window.JF = JF;
}

export { JF };
