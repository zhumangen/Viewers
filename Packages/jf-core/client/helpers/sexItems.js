import { Template } from 'meteor/templating';

Template.registerHelper('patientSexItems', () => {
  const items = [{
    value: 'M',
    label: '男'
  }, {
    value: 'F',
    label: '女'
  }, {
    value: 'O',
    label: '其他'
  }];
  items.unshift(JF.ui.selectNoneItem);
  return items;
});
