import { JF } from 'meteor/jf:core';

JF.dicomlist.getPatientAge = (ageStr, birthStr, dateStr) => {
  let result;
  if (ageStr) {
    result = ageStr;
  } else {
    const birth = moment(birthStr, 'YYYYMMDD');
    const date = moment(dateStr, 'YYYYMMDD');
    if (birth && date) {
      const year = date.get('year') - birth.get('year');
      const month = date.get('month') - birth.get('month');
      const week = date.get('week') - birth.get('week');
      const day = date.get('date') - birth.get('date');
      if (year > 0) {
        result = year + 'Y';
      } else if (month > 0) {
        result = month + 'M';
      } else if (week > 0) {
        result = week + 'W';
      } else if (day > 0) {
        result = day + 'D';
      }
    }
  }

  return result;
}
