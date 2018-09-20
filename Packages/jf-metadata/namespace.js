/**
 * Import main dependency...
 */

import { JF } from 'meteor/jf:core';

/**
 * Create Metadata namespace...
 */

const Metadata = {};

/**
 * Append Metadata namespace to OHIF namespace...
 */

JF.metadata = Metadata;

/**
 * Export relevant objects...
 */

export { JF, Metadata };
