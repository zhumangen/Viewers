import { Meteor } from 'meteor/meteor';
import { measurementTools } from 'meteor/jf:lesiontracker/both/configuration/measurementTools';
import { DefinitionSuffix } from 'meteor/jf:select-form/both/collections/lesionResponses';

measurementTools.forEach(tool => {
    Meteor.subscribe(tool.id + DefinitionSuffix);
});
