import { Template } from 'meteor/templating';

Template.registerHelper('formatPatientName', context => {
  if (!context || typeof context !== 'string') {
    return;
  }
  return context.replace(/\^/g, '');
});

Template.registerHelper('formatPatientSex', context => {
  if (!context || typeof context !== 'string') {
    return;
  }
  const sex = context.toUpperCase();
  if (sex === 'M') {
    return '男';
  } else if (sex === 'F') {
    return '女';
  } else {
    return '其他';
  }
});

Template.registerHelper('formatPatientAge', ageStr => {
    const result = '未知';
    if (ageStr) {
      const unit = ageStr.charAt(ageStr.length-1).toUpperCase();
      const value = ageStr.slice(0, ageStr.length-1);
      switch (unit) {
        case 'Y':
          result = value + '岁';
          break;
        case 'M':
          result = value + '月';
          break;
        case 'W':
          result = value + '周';
          break;
        case 'D':
          result = value + '天';
          break;
      }
    }

    return result;
});

Template.registerHelper('formatDateTime', context => {
  if (!context) return;
  return moment(new Date(context)).format('YYYY/MM/DD HH:mm:ss');
});
