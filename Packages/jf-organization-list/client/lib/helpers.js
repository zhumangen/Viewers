import { Template } from 'meteor/templating';

Template.registerHelper('orgTypes2Str', types => {
  let typeStr = '';
  if (types) {
    Object.keys(types).forEach(k => {
      if (types[k]) {
        switch (k) {
          case 'SCU':
            typeStr += '医疗机构，';
            break;
          case 'SCP':
            typeStr += '影像中心，';
            break;
        }
      }
    });
  }
  return typeStr?typeStr.substring(0, typeStr.length-1):typeStr;
});
