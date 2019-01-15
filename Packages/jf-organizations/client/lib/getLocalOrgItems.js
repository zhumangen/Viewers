import { JF } from 'meteor/jf:core';

JF.organization.getLocalOrgItems = function(orgIds, options) {
  const items = [];
  const opts = Object.assign({}, options, { findAll: true });
  const orgs = JF.organization.getLocalOrganizations.call(this, orgIds, opts);
  orgs.forEach(org => items.push({ value: org._id, label: org.name }));
  items.unshift(JF.ui.selectNoneItem);
  return items;
}
