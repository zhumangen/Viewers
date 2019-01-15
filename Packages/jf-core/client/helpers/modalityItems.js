import { Template } from 'meteor/templating';

Template.registerHelper('modalityItems', () => {
  const items = [{
    value: 'DX',
    label: 'DX'
  }, {
    value: 'DR',
    label: 'DR'
  }, {
    value: 'CR',
    label: 'CR'
  }, {
    value: 'CT',
    label: 'CT'
  }, {
    value: 'MR',
    label: 'MR'
  }, {
    value: 'US',
    label: 'US'
  }];
  items.unshift(JF.ui.selectNoneItem);
  return items;
});
