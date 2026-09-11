import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ZelvynChromeContextValue = {
  measurementsOpen: boolean;
  openMeasurements: () => void;
  closeMeasurements: () => void;
  toggleMeasurements: () => void;
};

const ZelvynChromeContext = createContext<ZelvynChromeContextValue | null>(null);

export function ZelvynChromeProvider({ children }: { children: React.ReactNode }) {
  const [measurementsOpen, setMeasurementsOpen] = useState(false);

  const openMeasurements = useCallback(() => setMeasurementsOpen(true), []);
  const closeMeasurements = useCallback(() => setMeasurementsOpen(false), []);
  const toggleMeasurements = useCallback(() => setMeasurementsOpen(v => !v), []);

  const value = useMemo(
    () => ({
      measurementsOpen,
      openMeasurements,
      closeMeasurements,
      toggleMeasurements,
    }),
    [measurementsOpen, openMeasurements, closeMeasurements, toggleMeasurements]
  );

  return (
    <ZelvynChromeContext.Provider value={value}>{children}</ZelvynChromeContext.Provider>
  );
}

export function useZelvynChrome() {
  const ctx = useContext(ZelvynChromeContext);
  if (!ctx) {
    return {
      measurementsOpen: false,
      openMeasurements: () => {},
      closeMeasurements: () => {},
      toggleMeasurements: () => {},
    };
  }
  return ctx;
}

export default ZelvynChromeContext;
