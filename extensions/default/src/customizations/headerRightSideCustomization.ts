import HeaderUndoRedo from '../ViewerLayout/HeaderUndoRedo';

/**
 * Right side of ZelvynViewerChrome (ahead of settings).
 * Patient/study meta moved to chrome center (ViewerStudyMeta) — do not
 * re-add HeaderPatientInfo here or it duplicates the center strip.
 */
export default {
  'ohif.headerRightSide': {
    items: [HeaderUndoRedo],
  },
};
