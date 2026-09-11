import React, { useMemo } from 'react';
import { Icons } from '@ohif/ui-next';
import { useSystem } from '@ohif/core';
import usePatientInfo from '../hooks/usePatientInfo';
import { PatientInfoVisibility } from './HeaderPatientInfo/HeaderPatientInfo';

const ellipsis = (str: string | null | undefined, max: number) => {
  if (!str) {
    return '';
  }
  return str.length > max ? `${str.substring(0, max)}…` : str;
};

type ViewerStudyMetaProps = {
  modeLabel?: string;
};

/**
 * Center meta for ZelvynViewerChrome — patient + green check + study label + Basic pills.
 *
 * Pills are intentional chrome (active mode + secondary context), not a live mode
 * switcher: mid-viewer mode/route changes require a full navigate + mode teardown
 * in OHIF and would be a large rewrite. Secondary pill shows study modality when
 * known, otherwise the active hanging-protocol name / "Default".
 */
export function ViewerStudyMeta({ modeLabel = 'Basic' }: ViewerStudyMetaProps) {
  const { extensionManager, servicesManager } = useSystem();
  const { showPatientInfo } = extensionManager.appConfig;
  const { patientInfo, isMixedPatients } = usePatientInfo();
  const hangingProtocolService = servicesManager?.services?.hangingProtocolService;

  const secondaryPill = useMemo(() => {
    if (patientInfo.Modality) {
      return String(patientInfo.Modality).toUpperCase();
    }
    try {
      const active = hangingProtocolService?.getActiveProtocol?.();
      const name = active?.protocol?.name || active?.protocol?.id;
      if (name && String(name).toLowerCase() !== 'default') {
        return String(name);
      }
    } catch {
      // HP may not be ready
    }
    return 'Default';
  }, [patientInfo.Modality, hangingProtocolService]);

  if (showPatientInfo === PatientInfoVisibility.DISABLED) {
    return null;
  }

  const name = isMixedPatients
    ? 'Multiple Patients'
    : ellipsis(patientInfo.PatientName, 28) || 'Patient';

  const studyLabel =
    ellipsis(patientInfo.StudyLabel, 40) ||
    ellipsis(patientInfo.StudyDescription, 40) ||
    ellipsis(
      [patientInfo.Modality, patientInfo.SeriesDescription].filter(Boolean).join(' '),
      40
    );

  return (
    <div
      className="flex max-w-[min(820px,70vw)] flex-wrap items-center gap-2 truncate"
      data-chrome="zelvyn-study-meta"
    >
      <span className="truncate text-[13px] font-semibold text-[color:var(--text-primary,#E8EEF4)]">
        {name}
      </span>
      {!isMixedPatients ? (
        <span
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[color:var(--success,#34D399)]/20 text-[color:var(--success,#34D399)]"
          title="Patient verified"
          aria-label="Patient verified"
        >
          <Icons.StatusSuccess className="h-3 w-3" />
        </span>
      ) : (
        <Icons.MultiplePatients className="h-4 w-4 shrink-0 text-[color:var(--accent,#2DD4BF)]" />
      )}

      {studyLabel ? (
        <>
          <span
            className="h-4 w-px shrink-0 bg-[color:var(--border-subtle,#1E2A36)]"
            aria-hidden
          />
          <span
            className="truncate text-[12px] font-medium text-[color:var(--text-secondary,#9AA8B6)]"
            title={patientInfo.StudyDescription || studyLabel}
            data-cy="zelvyn-study-label"
          >
            {studyLabel}
          </span>
        </>
      ) : patientInfo.Modality ? (
        <>
          <span
            className="h-4 w-px shrink-0 bg-[color:var(--border-subtle,#1E2A36)]"
            aria-hidden
          />
          <span className="text-[12px] font-medium text-[color:var(--text-secondary,#9AA8B6)]">
            {patientInfo.Modality}
          </span>
        </>
      ) : null}

      {/* Mode pills — active = current mode; secondary = modality/protocol context (not clickable) */}
      <span
        className="ml-1 inline-flex items-center gap-1.5"
        title="Mode pills are decorative: switching OHIF modes mid-viewer needs a full route remount"
        data-chrome="zelvyn-mode-pills"
      >
        <span
          className="inline-flex items-center gap-1 rounded-full border border-[color:var(--accent,#2DD4BF)]/70 bg-transparent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--accent,#2DD4BF)]"
          aria-current="true"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent,#2DD4BF)]" />
          {modeLabel}
        </span>
        <span className="inline-flex items-center rounded-full bg-[color:var(--bg-input,#161E27)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--text-secondary,#9AA8B6)] ring-1 ring-[color:var(--border-strong,#2A3A4A)]">
          {secondaryPill}
        </span>
      </span>
    </div>
  );
}

export default ViewerStudyMeta;
