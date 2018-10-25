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
    return '未知';
  }
});

Template.registerHelper('formatPatientAge', (ageStr, birthStr, dateStr) => {
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
    } else {
      const birth = moment(birthStr, 'YYYYMMDD');
      const date = moment(dateStr, 'YYYYMMDD');
      const year = date.get('year') - birth.get('year');
      const month = date.get('month') - birth.get('month');
      const week = date.get('week') - birth.get('week');
      const day = date.get('date') - birth.get('date');
      if (year > 0) {
        result = year + '岁';
      } else if (month > 0) {
        result = month + '月';
      } else if (week > 0) {
        result = week + '周';
      } else if (day > 0) {
        result = day + '天';
      }
    }

    return result;
})
