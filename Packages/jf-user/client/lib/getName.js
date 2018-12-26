import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

JF.user.getName = () => {
    const user = Meteor.user();
    if (!user || !user.profile) return '';
    const fullName = user.profile.fullName;

    if (fullName.indexOf(' ') >= 0) {
      const nameSplit = fullName.split(' ');
      const lastName = nameSplit[nameSplit.length - 1];
      nameSplit[nameSplit.length - 1] = lastName.substr(0, 1) + '.';
      return nameSplit.join(' ');
    }

    return fullName;
};
