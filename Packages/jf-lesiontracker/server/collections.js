import { Mongo } from 'meteor/mongo';
import { JF } from 'meteor/jf:core';
import { measurementTools } from 'meteor/jf:lesiontracker/both/configuration/measurementTools';

let MeasurementCollections = {};
measurementTools.forEach(tool => {
    MeasurementCollections[tool.id] = new Mongo.Collection(tool.id);
    MeasurementCollections[tool.id]._debugName = tool.id;
});

JF.collections.measurements = MeasurementCollections;
