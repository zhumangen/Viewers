import React, { useMemo } from 'react';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { Button, Icons } from '@ohif/ui-next';
import { COLUMN_IDS, type StudyDateRangeFilter } from '@ohif/ui-next';

type WorkListFilterChipsProps = {
  filters: ColumnFiltersState;
  onClearAll: () => void;
  onRemoveFilter: (columnId: string) => void;
};

function formatDateChip(value: unknown): string | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const range = value as StudyDateRangeFilter;
  const start = range.startDate ?? '';
  const end = range.endDate ?? '';
  if (!start && !end) {
    return null;
  }
  if (start && end && start === end) {
    return start;
  }
  if (start && end) {
    return `${start} → ${end}`;
  }
  return start || end || null;
}

/**
 * Filter chips chrome row (mockup 02). Reflects active Study List filters;
 * clearing chips updates the same ColumnFiltersState used by DataTable.
 */
export function WorkListFilterChips({
  filters,
  onClearAll,
  onRemoveFilter,
}: WorkListFilterChipsProps) {
  const chips = useMemo(() => {
    const out: Array<{ id: string; label: string; value: string }> = [];
    for (const f of filters) {
      if (f.id === COLUMN_IDS.MODALITIES && Array.isArray(f.value) && f.value.length) {
        out.push({
          id: f.id,
          label: 'Modality',
          value: (f.value as string[]).join(', '),
        });
      } else if (f.id === COLUMN_IDS.STUDY_DATE_TIME) {
        const formatted = formatDateChip(f.value);
        if (formatted) {
          out.push({ id: f.id, label: 'Date', value: formatted });
        }
      } else if (typeof f.value === 'string' && f.value.trim()) {
        const labels: Record<string, string> = {
          [COLUMN_IDS.PATIENT]: 'Patient',
          [COLUMN_IDS.MRN]: 'MRN',
          [COLUMN_IDS.ACCESSION]: 'Accession',
          [COLUMN_IDS.DESCRIPTION]: 'Description',
        };
        out.push({
          id: f.id,
          label: labels[f.id] ?? f.id,
          value: f.value.trim(),
        });
      }
    }
    return out;
  }, [filters]);

  const hasChips = chips.length > 0;

  return (
    <div className="bg-card/80 border-border flex shrink-0 flex-wrap items-center gap-2 border-b px-3 py-2">
      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
        Filters
      </span>
      {chips.map(chip => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onRemoveFilter(chip.id)}
          className="border-border bg-accent text-foreground hover:bg-accent/80 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
          aria-label={`Remove ${chip.label} filter`}
        >
          <span className="text-muted-foreground">{chip.label}:</span>
          <span className="text-primary font-medium">{chip.value}</span>
          <Icons.Close className="text-muted-foreground h-3 w-3" />
        </button>
      ))}
      {!hasChips && (
        <span className="text-muted-foreground text-xs">
          Use the table filter row, or search above. Active filters appear as chips.
        </span>
      )}
      <div className="ml-auto flex items-center gap-1">
        {hasChips && (
          <Button
            variant="ghost"
            size="sm"
            className="text-primary h-7 px-2 text-xs"
            onClick={onClearAll}
          >
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
}

export default WorkListFilterChips;
