/**
 * Import main dependency
 */

import { JF } from 'meteor/jf:core';

/**
 * Create Viewerbase namespace
 */

const Viewerbase = {};

/**
 * Append Viewerbase namespace to JF namespace
 */

JF.viewerbase = Viewerbase;

/**
 * Export relevant objects
 */

export { JF, Viewerbase };
