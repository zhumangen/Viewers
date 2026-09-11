import React from 'react';
import { Button, Icons, cn } from '@ohif/ui-next';
import { useSystem } from '@ohif/core';
import { useTranslation } from 'react-i18next';

/**
 * Measurement panel action bar.
 * - layout="footer": sticky panel footer (Export CSV / Delete / Save) — Phase 3 tracking panel
 * - layout="inline": compact bar for study summary headers (non-tracking panel)
 * Commands / filters unchanged.
 */
export function StudyMeasurementsActions({
  items,
  StudyInstanceUID,
  measurementFilter,
  actions,
  layout = 'footer',
}) {
  const { commandsManager } = useSystem();
  const { t } = useTranslation('MeasurementTable');
  const disabled = !items?.length;

  if (disabled) {
    return null;
  }

  const onExportCsv = () => {
    commandsManager.runCommand('downloadCSVMeasurementsReport', {
      StudyInstanceUID,
      measurementFilter,
    });
  };

  const onSave = e => {
    e.stopPropagation();
    if (actions?.createSR) {
      actions.createSR({ StudyInstanceUID, measurementFilter });
      return;
    }
    commandsManager.run('promptSaveReport', {
      StudyInstanceUID,
      measurementFilter,
    });
  };

  const onDelete = e => {
    e.stopPropagation();
    if (actions?.onDelete) {
      actions.onDelete();
      return;
    }
    commandsManager.runCommand('clearMeasurements', {
      measurementFilter,
    });
  };

  if (layout === 'inline') {
    return (
      <div
        className="bg-bkg-med flex h-8 w-full items-center rounded pr-0.5"
        data-cy="measurement-panel-actions-inline"
      >
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="ghost"
            className="pl-1.5"
            onClick={onExportCsv}
          >
            <Icons.Download className="h-5 w-5" />
            <span className="pl-1">CSV</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="pl-0.5"
            onClick={onSave}
          >
            <Icons.Add />
            {t('Save')}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-danger pl-0.5"
            onClick={onDelete}
          >
            <Icons.Delete />
            {t('Delete')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-border bg-bkg-med flex w-full shrink-0 flex-col gap-1.5 border-t px-2 py-2'
      )}
      data-cy="measurement-panel-footer"
    >
      <div className="flex w-full items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className="border-border text-foreground hover:bg-accent/40 h-8 flex-1 justify-center gap-1.5"
          onClick={onExportCsv}
        >
          <Icons.Download className="h-4 w-4" />
          <span>Export CSV</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="border-danger/40 text-danger hover:bg-[var(--error-bg)] h-8 flex-1 justify-center gap-1.5"
          onClick={onDelete}
        >
          <Icons.Delete className="h-4 w-4" />
          <span>{t('Delete')}</span>
        </Button>
      </div>

      <Button
        size="sm"
        variant="default"
        className="h-8 w-full justify-center gap-1.5"
        onClick={onSave}
      >
        <Icons.Add className="h-4 w-4" />
        <span>{t('Save')}</span>
      </Button>
    </div>
  );
}

export default StudyMeasurementsActions;
