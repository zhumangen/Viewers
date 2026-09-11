import React from 'react';
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

/**
 * Center meta strip for ZelvynViewerChrome — patient + study + modality chips.
 * Replaces the stock OHIF right-side PatientInfo pattern for the product bar.
 */
export function ViewerStudyMeta() {
  const { extensionManager } = useSystem();
  const { showPatientInfo } = extensionManager.appConfig;
  const { patientInfo, isMixedPatients } = usePatientInfo();

  if (showPatientInfo === PatientInfoVisibility.DISABLED) {
    return null;
  }

  const name = isMixedPatients
    ? 'Multiple Patients'
    : ellipsis(patientInfo.PatientName, 28) || 'Patient';
  const study = ellipsis(patientInfo.StudyDescription, 36);
  const modality = patientInfo.Modality;
  const studyDate = patientInfo.StudyDate;
  const id = ellipsis(patientInfo.PatientID, 16);

  return (
    <div
      className="flex max-w-[min(720px,52vw)] items-center gap-2 truncate"
      data-chrome="zelvyn-study-meta"
    >
      {isMixedPatients ? (
        <Icons.MultiplePatients className="text-[color:var(--accent,#2DD4BF)] h-4 w-4 shrink-0" />
      ) : (
        <Icons.Patient className="text-[color:var(--accent,#2DD4BF)] h-4 w-4 shrink-0" />
      )}
      <span className="truncate text-[13px] font-semibold text-[color:var(--text-primary,#E8EEF4)]">
        {name}
      </span>
      {!isMixedPatients && id ? (
        <span className="hidden truncate font-mono text-[11px] text-[color:var(--text-muted,#6B7A8A)] md:inline">
          {id}
        </span>
      ) : null}
      {patientInfo.PatientSex || patientInfo.PatientDOB ? (
        <span className="hidden text-[11px] text-[color:var(--text-secondary,#9AA8B6)] lg:inline">
          {[patientInfo.PatientSex, patientInfo.PatientDOB].filter(Boolean).join(' · ')}
        </span>
      ) : null}
      {study ? (
        <>
          <span
            className="bg-[color:var(--border-subtle,#1E2A36)] hidden h-4 w-px shrink-0 sm:inline"
            aria-hidden
          />
          <span className="hidden truncate text-[12px] text-[color:var(--text-secondary,#9AA8B6)] sm:inline">
            {study}
          </span>
        </>
      ) : null}
      {studyDate ? (
        <span className="hidden text-[11px] text-[color:var(--text-muted,#6B7A8A)] xl:inline">
          {studyDate}
        </span>
      ) : null}
      {modality ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[color:var(--accent,#2DD4BF)]/50 bg-[color:var(--accent,#2DD4BF)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--accent,#2DD4BF)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent,#2DD4BF)]" />
          {modality}
        </span>
      ) : (
        <span className="inline-flex shrink-0 items-center rounded-full border border-[color:var(--border-strong,#2A3A4A)] bg-[color:var(--bg-input,#161E27)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--text-secondary,#9AA8B6)]">
          Viewer
        </span>
      )}
    </div>
  );
}

export default ViewerStudyMeta;
