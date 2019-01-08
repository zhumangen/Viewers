import { JF } from 'meteor/jf:core';

JF.organizationlist.clearSelections = () => {
  JF.ui.rowSelect.doClearSelections.call(JF.organizationlist);
};

JF.organizationlist.getSelectedOrgIds = () => {
  return JF.ui.rowSelect.getSelectedRows.call(JF.organizationlist);
}

JF.organizationlist.getSelectedOrganizations = () => {
  const rowIds = JF.organizationlist.getSelectedOrgIds();
  return rowIds.map(rowId => JF.collections.organizations.find({ _id: rowId }).fetch()[0]);
};
