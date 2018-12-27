import { JF } from 'meteor/jf:core';
import { measurementTools } from 'meteor/jf:lesiontracker/both/configuration/measurementTools';

JF.lesiontracker.getLesionTypes = () => {
  const toolId = measurementTools[0].id;
  const defs = JF.collections.definitions[toolId];
  const ts = defs.find().fetch();
  return ts.map(t => { return { value: t.code, label: t.name.zh}; });
}
