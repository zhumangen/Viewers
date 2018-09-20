import { JF } from 'meteor/jf:core';
import { HotkeysManager } from 'meteor/jf:hotkeys/client/classes/HotkeysManager';
import 'jquery.hotkeys';

// Create hotkeys namespace using a HotkeysManager class instance
const hotkeys = new HotkeysManager();

// Append hotkeys namespace to OHIF namespace
JF.managers.hotkeys = hotkeys;

// Export relevant objects
export { hotkeys };
