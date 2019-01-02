import { JF } from 'meteor/jf:core';
import { _ } from 'meteor/underscore';
import { measurementTools } from 'meteor/jf:lesiontracker/both/configuration/measurementTools';

JF.lesiontracker.getLesionTypes = codes => {
  const toolId = measurementTools[0].id;
  const defs = JF.collections.definitions[toolId];
  const filter = {};
  if (codes) {
    if (!_.isArray(codes)) {
      codes = [codes];
    }
    filter.$or = [];
    codes.forEach(code => filter.$or.push({ code }));
  }
  const ts = defs.find(filter).fetch();
  return ts.map(t => { return { value: t.code, label: t.name.zh}; });
}
