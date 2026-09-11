import { useState, useEffect } from 'react';
import { utils, useSystem } from '@ohif/core';

const { formatPN, formatDate } = utils;

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
  });
  const [isMixedPatients, setIsMixedPatients] = useState(false);

  const checkMixedPatients = (PatientID: string) => {
    const displaySets = displaySetService.getActiveDisplaySets();
    let isMixedPatients = false;
    displaySets.forEach(displaySet => {
      const instance = displaySet?.instances?.[0] || displaySet?.instance;
      if (!instance) {
        return;
      }
      if (instance.PatientID !== PatientID) {
        isMixedPatients = true;
      }
    });
    setIsMixedPatients(isMixedPatients);
  };

  const updatePatientInfo = ({ displaySetsAdded }) => {
    if (!displaySetsAdded?.length) {
      return;
    }
    const displaySet = displaySetsAdded[0];
    const instance = displaySet?.instances?.[0] || displaySet?.instance;
    if (!instance) {
      return;
    }

    setPatientInfo({
      PatientID: instance.PatientID || null,
      PatientName: instance.PatientName ? formatPN(instance.PatientName) : null,
      PatientSex: instance.PatientSex || null,
      PatientDOB: formatDate(instance.PatientBirthDate) || null,
      StudyDescription: instance.StudyDescription || displaySet?.SeriesDescription || null,
      StudyDate: formatDate(instance.StudyDate) || null,
      Modality: instance.Modality || displaySet?.Modality || null,
    });
    checkMixedPatients(instance.PatientID || null);
  };

  useEffect(() => {
    // Seed from already-loaded display sets (study reopen / hot reload).
    const active = displaySetService.getActiveDisplaySets?.() || [];
    if (active.length) {
      updatePatientInfo({ displaySetsAdded: active });
    }

    const subscription = displaySetService.subscribe(
      displaySetService.EVENTS.DISPLAY_SETS_ADDED,
      props => updatePatientInfo(props)
    );
    return () => subscription.unsubscribe();
  }, []);

  return { patientInfo, isMixedPatients };
}

export default usePatientInfo;
