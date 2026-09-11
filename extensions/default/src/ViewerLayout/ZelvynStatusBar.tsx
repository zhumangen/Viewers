import React, { useMemo } from 'react';
import usePatientInfo from '../hooks/usePatientInfo';

function computeAge(dobFormatted: string | null | undefined): string | null {
  if (!dobFormatted) {
    return null;
  }
  // formatDate often yields YYYY-MM-DD or localized; try ISO-ish parse
  const m = String(dobFormatted).match(/(\d{4})/);
  if (!m) {
    return null;
  }
  const year = parseInt(m[1], 10);
  if (!year || year < 1900) {
    return null;
  }
  const age = new Date().getFullYear() - year;
  return age >= 0 && age < 130 ? `${age}y` : null;
}

/**
 * Bottom status bar — patient meta left, Viewer version right.
 * Matches viewer-design.png footer; investigational banner stays removed.
 */
export function ZelvynStatusBar() {
  const { patientInfo, isMixedPatients } = usePatientInfo();
  const version =
    (typeof process !== 'undefined' && process.env?.VERSION_NUMBER) ||
    (typeof window !== 'undefined' && (window as any).config?.version) ||
    '—';

  const age = useMemo(() => computeAge(patientInfo.PatientDOB), [patientInfo.PatientDOB]);

  const dobPart = patientInfo.PatientDOB
    ? `DOB: ${patientInfo.PatientDOB}${age ? ` (${age})` : ''}`
    : null;

  const leftBits = isMixedPatients
    ? ['Multiple patients']
    : [
        patientInfo.PatientID ? `Patient ID: ${patientInfo.PatientID}` : null,
        dobPart,
        patientInfo.PatientSex || null,
      ].filter(Boolean);

  return (
    <footer
      className="zelvyn-status-bar flex h-7 shrink-0 items-center justify-between gap-3 border-t border-[color:var(--border-subtle,#1E2A36)] bg-[color:var(--bg-elevated,#12181F)] px-3 text-[11px] text-[color:var(--text-secondary,#9AA8B6)]"
      data-chrome="zelvyn-status-bar"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 truncate">
        {leftBits.map((bit, i) => (
          <React.Fragment key={i}>
            {i > 0 ? (
              <span
                className="text-[color:var(--text-muted,#6B7A8A)]"
                aria-hidden
              >
                ·
              </span>
            ) : null}
            <span className="truncate">{bit}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span>Viewer: {version}</span>
        <span
          className="text-[color:var(--text-muted,#6B7A8A)]"
          aria-hidden
        >
          ·
        </span>
        <span>DICOM CP-246</span>
      </div>
    </footer>
  );
}

export default ZelvynStatusBar;
