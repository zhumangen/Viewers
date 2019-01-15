import { Template } from 'meteor/templating';

Template.registerHelper('orgTypeItems', () => {
  const items = [{
    value: 'SCU',
    label: '医疗机构'
  }, {
    value: 'SCP',
    label: '影像中心'
  }];
  items.unshift(JF.ui.selectNoneItem);
  return items;
});
