import React from 'react';
import { StudySummaryFromMetadata } from './StudySummaryFromMetadata';

/**
 * Study accordion trigger content.
 * Export / delete / save live in the panel sticky footer (Phase 3).
 */
export function StudySummaryWithActions(props) {
  return (
    <div>
      <StudySummaryFromMetadata {...props} />
    </div>
  );
}

export default StudySummaryWithActions;
