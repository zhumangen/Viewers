import { JF } from 'meteor/jf:core';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { measurementTools } from 'meteor/jf:lesiontracker/both/configuration/measurementTools';

JF.lesiontracker.getLesionCodes = codes => {
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

Template.registerHelper('getLesionName', code => {
  const types = JF.lesiontracker.getLesionCodes(code);
  return types.length>0?types[0].label:'';
});
