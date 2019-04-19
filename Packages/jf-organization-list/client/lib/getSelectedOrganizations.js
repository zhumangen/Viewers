import { JF } from 'meteor/jf:core';
import { _ } from 'meteor/underscore';

JF.organizationlist.clearSelections = () => {
  JF.ui.rowSelect.doClearSelections.call(JF.organizationlist);
};

JF.organizationlist.getSelectedOrgIds = () => {
  return JF.ui.rowSelect.getSelectedRows.call(JF.organizationlist);
}

JF.organizationlist.getSelectedOrganizations = () => {
  const rowIds = JF.organizationlist.getSelectedOrgIds();
  return _.compact(rowIds.map(rowId => JF.collections.organizations.findOne({ _id: rowId })));
};
