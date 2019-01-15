import { Template } from 'meteor/templating';

Template.registerHelper('qidoLevelItems', () => {
  const items = [{
    value: 'STUDY',
    label: '检查'
  }, {
    value: 'SERIES',
    label: '序列'
  }];
  items.unshift(JF.ui.selectNoneItem);
  return items;
});
