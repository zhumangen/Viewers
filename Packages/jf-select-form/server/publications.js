import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { check } from 'meteor/check';
import { measurementTools } from 'meteor/jf:lesiontracker/both/configuration/measurementTools';
import { Definitions, DefinitionSuffix } from 'meteor/jf:select-form/both/collections/lesionResponses';

measurementTools.forEach(tool => {
    Meteor.publish(tool.id + DefinitionSuffix, (bodyPart) => {
        const filter = {};
        if (!!bodyPart) {
            JF.validation.checks.checkNonEmptyString(bodyPart);
            filter.part = bodyPart;
        }
        return Definitions[tool.id].find(filter);
    });
});
