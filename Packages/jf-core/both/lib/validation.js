import { JF } from 'meteor/jf:core';
import { check, Match } from 'meteor/check';

const Validator = {
  NonEmptyString: Match.Where(arg => {
      check(arg, String);
      return arg.length > 0;
  }),
  NonEmptyStringArray: Match.Where(arg => {
      check(arg, [String]);
      return arg.length > 0;
  }),
  PositiveNumber: Match.Where(arg => {
      check(arg, Number);
      return arg > 0;
  }),
  NonNegativeNumber: Match.Where(arg => {
      check(arg, Number);
      return !(arg < 0);
  })
};

const Checks = {
  checkString: arg => check(arg, String),
  checkNonEmptyString: arg => check(arg, Validator.NonEmptyString),
  checkNonEmptyStringArray: arg => check(arg, Validator.NonEmptyStringArray),
  checkPositiveNumber: arg => check(arg, Validator.PositiveNumber),
  checkNonNegativeNumber: arg => check(arg, Validator.NonNegativeNumber)
}

JF.validation.validator = Validator;
JF.validation.checks = Checks;

export { Validation, Checks };
