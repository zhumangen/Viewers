import { Template } from 'meteor/templating';

Template.registerHelper('orgTypes', types => {
  let typeStr = '';
  types.forEach(t => typeStr += (t==='SCP')?'影像中心，':'医疗机构，');
  return typeStr.substring(0, typeStr.length-1);
});
