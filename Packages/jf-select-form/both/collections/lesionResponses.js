import { Mongo } from 'meteor/mongo';
import { JF } from 'meteor/jf:core';
import { measurementTools } from 'meteor/jf:lesiontracker/both/configuration/measurementTools';

const Definitions = {};
const DefinitionSuffix = '_def';

measurementTools.forEach(tool => {
    Definitions[tool.id] = new Mongo.Collection(tool.id + DefinitionSuffix);
    Definitions[tool.id]._debugName = tool.id + DefinitionSuffix;
});

JF.collections.definitions = Definitions;

export { Definitions, DefinitionSuffix };
