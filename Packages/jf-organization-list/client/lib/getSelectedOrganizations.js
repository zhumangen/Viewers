import { JF } from 'meteor/jf:core';

JF.organizationlist.getSelectedOrganizations = () => {
  const rowIds = JF.ui.rowSelect.getSelectedRows.call(JF.organizationlist);
  return rowIds.map(rowId => JF.collections.organizations.find({ _id: rowId }).fetch()[0]);
};
