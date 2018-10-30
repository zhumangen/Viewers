import { Template } from 'meteor/templating';

/**
 * Global Blaze UI helpers
 */

const SIGN_REGEXP = /([yMdhsm])(\1*)/g;
const DEFAULT_PATTERN = 'yyyy/MM/dd hh:mm:ss';

const padding = (s, len) => {
    var len = len - (s + '').length;
    for (var i = 0; i < len; i++) { s = '0' + s; }
    return s;
};

// convert date to string
Template.registerHelper('dateToString', (dateObj, pattern) => {
  if (!dateObj) return '';
  pattern = pattern || DEFAULT_PATTERN;
  return pattern.replace(SIGN_REGEXP, function ($0) {
      switch ($0.charAt(0)) {
          case 'y': return padding(dateObj.getFullYear(), $0.length);
          case 'M': return padding(dateObj.getMonth() + 1, $0.length);
          case 'd': return padding(dateObj.getDate(), $0.length);
          case 'w': return dateObj.getDay() + 1;
          case 'h': return padding(dateObj.getHours(), $0.length);
          case 'm': return padding(dateObj.getMinutes(), $0.length);
          case 's': return padding(dateObj.getSeconds(), $0.length);
      }
  });
});

// convert string to date
Template.registerHelper('stringToDate', (dateStr, pattern) => {
  pattern = pattern || DEFAULT_PATTERN;
  var matchs1 = pattern.match(SIGN_REGEXP);
  var matchs2 = dateStr.match(/(\d)+/g);
  if (matchs1.length == matchs2.length) {
      var _date = new Date(1970, 0, 1);
      for (var i = 0; i < matchs1.length; i++) {
          var _int = parseInt(matchs2[i]);
          var sign = matchs1[i];
          switch (sign.charAt(0)) {
              case 'y': _date.setFullYear(_int); break;
              case 'M': _date.setMonth(_int - 1); break;
              case 'd': _date.setDate(_int); break;
              case 'h': _date.setHours(_int); break;
              case 'm': _date.setMinutes(_int); break;
              case 's': _date.setSeconds(_int); break;
          }
      }
      return _date;
  }
  return null;
});
