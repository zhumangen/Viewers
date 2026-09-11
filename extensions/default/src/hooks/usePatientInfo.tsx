import { useState, useEffect, useCallback } from 'react';
import { utils, useSystem } from '@ohif/core';

const { formatPN, formatDate } = utils;

/**
 * Build a mockup-style study label, e.g. "CT Chest".
 * Prefer StudyDescription; else Modality + BodyPart/SeriesDescription.
 */
export function buildStudyLabel({
  StudyDescription,
  SeriesDescription,
  Modality,
  BodyPartExamined,
  ProtocolName,
}: {
  StudyDescription?: string | null;
  SeriesDescription?: string | null;
  Modality?: string | null;
  BodyPartExamined?: string | null;
  ProtocolName?: string | null;
}): string {
  const study = (StudyDescription || '').trim();
  if (study) {
    return study;
  }
  const part = (BodyPartExamined || ProtocolName || SeriesDescription || '').trim();
  const mod = (Modality || '').trim();
  if (mod && part) {
    if (part.toUpperCase().startsWith(mod.toUpperCase())) {
      return part;
    }
    return `${mod} ${part}`;
  }
  return mod || part || '';
}

function usePatientInfo() {
  const { servicesManager } = useSystem();
  const { displaySetService } = servicesManager.services;

  const [patientInfo, setPatientInfo] = useState({
    PatientName: '',
    PatientID: '',
    PatientSex: '',
    PatientDOB: '',
    StudyDescription: '',
    StudyDate: '',
    Modality: '',
    BodyPartExamined: '',
    SeriesDescription: '',
    StudyLabel: '',
  });
  const [isMixedPatients, setIsMixedPatients] = useState(false);

  const checkMixedPatients = (PatientID: string) => {
    const displaySets = displaySetService.getActiveDisplaySets();
    let mixed = false;
    displaySets.forEach(displaySet => {
      const instance = displaySet?.instances?.[0] || displaySet?.instance;
      if (!instance) {
        return;
      }
      if (instance.PatientID !== PatientID) {
        mixed = true;
      }
    });
    setIsMixedPatients(mixed);
  };

  const updateFromDisplaySets = useCallback(
    (displaySets: any[]) => {
      if (!displaySets?.length) {
        return;
      }
      // Prefer a display set that has StudyDescription / BodyPart when available
      const ranked = [...displaySets].sort((a, b) => {
        const score = (ds: any) => {
          const inst = ds?.instances?.[0] || ds?.instance || {};
          let s = 0;
          if (inst.StudyDescription || ds.StudyDescription) {
            s += 4;
          }
          if (inst.BodyPartExamined) {
            s += 2;
          }
          if (inst.SeriesDescription || ds.SeriesDescription) {
            s += 1;
          }
          return s;
        };
        return score(b) - score(a);
      });
      const displaySet = ranked[0];
      const instance = displaySet?.instances?.[0] || displaySet?.instance;
      if (!instance) {
        return;
      }

      const StudyDescription = instance.StudyDescription || displaySet?.StudyDescription || null;
      const SeriesDescription =
        instance.SeriesDescription || displaySet?.SeriesDescription || displaySet?.label || null;
      const Modality = instance.Modality || displaySet?.Modality || null;
      const BodyPartExamined = instance.BodyPartExamined || null;
      const ProtocolName = instance.ProtocolName || null;

      setPatientInfo({
        PatientID: instance.PatientID || null,
        PatientName: instance.PatientName ? formatPN(instance.PatientName) : null,
        PatientSex: instance.PatientSex || null,
        PatientDOB: formatDate(instance.PatientBirthDate) || null,
        StudyDescription,
        SeriesDescription,
        StudyDate: formatDate(instance.StudyDate) || null,
        Modality,
        BodyPartExamined,
        StudyLabel: buildStudyLabel({
          StudyDescription,
          SeriesDescription,
          Modality,
          BodyPartExamined,
          ProtocolName,
        }),
      });
      checkMixedPatients(instance.PatientID || null);
    },
    [displaySetService]
  );

  useEffect(() => {
    const active = displaySetService.getActiveDisplaySets?.() || [];
    if (active.length) {
      updateFromDisplaySets(active);
    }

    const { EVENTS } = displaySetService;
    const onAdded = props => {
      const sets = props?.displaySetsAdded?.length
        ? props.displaySetsAdded
        : displaySetService.getActiveDisplaySets?.() || [];
      updateFromDisplaySets(sets);
    };
    const onChanged = () => {
      updateFromDisplaySets(displaySetService.getActiveDisplaySets?.() || []);
    };

    const subs = [
      displaySetService.subscribe(EVENTS.DISPLAY_SETS_ADDED, onAdded),
      displaySetService.subscribe(EVENTS.DISPLAY_SETS_CHANGED, onChanged),
    ];
    return () => subs.forEach(s => s.unsubscribe());
  }, [displaySetService, updateFromDisplaySets]);

  return { patientInfo, isMixedPatients };
}

export default usePatientInfo;
