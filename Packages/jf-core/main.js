import { Meteor } from 'meteor/meteor';

/*
 * Defines the base OHIF object
 */

const JF = {
    lesiontracker: {},
    collections: {},
    managers: {},
    viewer: {},
    orderlist: {},
    ui: {}
};

// Expose the OHIF object to the client if it is on development mode
// @TODO: remove this after applying namespace to this package
if (Meteor.isClient) {
    window.JF = JF;
}

export { JF };
