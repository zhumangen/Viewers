import { JF } from 'meteor/jf:core';

let counter = Math.round(Math.random()*100000000);

JF.utils.randomString = function(bits) {
  let randStr = (++counter).toString();
  bits = bits? bits : 4;
  while (randStr.length < bits) {
    randStr = '0' + randStr;
  }
  return randStr.slice(randStr.length - bits);
}
