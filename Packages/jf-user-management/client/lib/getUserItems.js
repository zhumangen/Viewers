import { JF } from 'meteor/jf:core';
import { _ } from 'meteor/underscore';

JF.user.getUserItems = roles => {
  const items = [];

  if (!roles) return items;

  if (!_.isArray(roles)) {
    roles = [roles];
  }

  const users = JF.user.users.find().fetch();
  users.forEach(u => {
    const gns = Object.keys(u.roles);
    for (let gn of gns) {
      if (_.intersection(roles, u.roles[gn]).length > 0) {
        items.push({ value: u._id, label: u.profile.fullName });
        return;
      }
    }
  });

  items.unshift(JF.ui.selectNoneItem);
  return items;
}
