import React from 'react';
import PropTypes from 'prop-types';

export enum showDialogOption {
  NeverShowDialog = 'never',
  AlwaysShowDialog = 'always',
  ShowOnceAndConfigure = 'configure',
}

/**
 * Zelvyn shell v2: investigational-use footer is fully disabled.
 * Component always returns null so WorkList / Viewer never show the OHIF banner.
 */
const InvestigationalUseDialog = (_props: {
  dialogConfiguration?: { option?: string; days?: number };
}) => {
  return null;
};

InvestigationalUseDialog.propTypes = {
  dialogConfiguration: PropTypes.shape({
    option: PropTypes.oneOf(Object.values(showDialogOption)),
    days: PropTypes.number,
  }),
};

export default InvestigationalUseDialog;
