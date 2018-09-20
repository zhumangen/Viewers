import { JF } from 'meteor/jf:core';
import { WindowLevelPresetsManager } from 'meteor/jf:wl-presets/client/classes/WLPresetsManager';

const wlPresets = new WindowLevelPresetsManager();
JF.managers.wlPresets = wlPresets;

export { wlPresets };
