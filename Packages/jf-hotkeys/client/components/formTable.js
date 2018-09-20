import { Template } from 'meteor/templating';
import { JF } from 'meteor/jf:core';

Template.hotkeysFormTable.helpers({
    getLabel(input) {
        let result = input.label;
        if (input.key.indexOf('WLPreset') === 0) {
            const presetIndex = parseInt(input.key.replace('WLPreset', ''));
            const preset = JF.managers.currentWLPresets[presetIndex];
            if (preset.id) {
                result += ` (${preset.id})`;
            }
        }

        return result;
    }
});
