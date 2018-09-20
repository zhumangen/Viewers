import { JF } from 'meteor/jf:core';
import { check, Match } from 'meteor/check';

const Validation = {
  NonEmptyString: Match.Where(str => {
      check(str, String);
      return str.length > 0;
  }),
  NonEmptyStringArray: Match.Where(arr => {
      check(arr, [String]);
      return arr.length > 0;
  }),
  PositiveNumber: Match.Where(num => {
      check(num, Number);
      return num > 0;
  }),
  NonNegativeNumber: Match.Where(num => {
      check(num, Number);
      return !(num < 0);
  })
};

JF.validation = Validation;
export { Validation };
