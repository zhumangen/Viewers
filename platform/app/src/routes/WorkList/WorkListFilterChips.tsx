import React, { useMemo, useCallback } from 'react';
import type { ColumnFiltersState, Updater } from '@tanstack/react-table';
import { Button, Icons } from '@ohif/ui-next';
import { COLUMN_IDS, type StudyDateRangeFilter } from '@ohif/ui-next';

type WorkListFilterChipsProps = {
  filters: ColumnFiltersState;
  onClearAll: () => void;
  onRemoveFilter: (columnId: string) => void;
  onFiltersChange?: (updater: Updater<ColumnFiltersState>) => void;
};

const QUICK_MODALITIES = ['CT', 'MR', 'PT', 'US', 'XR'] as const;

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

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function lastNDays(n: number): StudyDateRangeFilter {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (n - 1));
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

function rangesEqual(a?: StudyDateRangeFilter | null, b?: StudyDateRangeFilter | null): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return (a.startDate ?? '') === (b.startDate ?? '') && (a.endDate ?? '') === (b.endDate ?? '');
}

/**
 * Filter chrome row — always-visible modality toggles + date presets + clear.
 * Not the stock OHIF column-filter-only look.
 */
export function WorkListFilterChips({
  filters,
  onClearAll,
  onRemoveFilter,
  onFiltersChange,
}: WorkListFilterChipsProps) {
  const selectedModalities = useMemo(() => {
    const f = filters.find(x => x.id === COLUMN_IDS.MODALITIES);
    return Array.isArray(f?.value) ? (f!.value as string[]).map(v => String(v).toUpperCase()) : [];
  }, [filters]);

  const dateFilter = useMemo(() => {
    const f = filters.find(x => x.id === COLUMN_IDS.STUDY_DATE_TIME);
    return f?.value && typeof f.value === 'object' ? (f.value as StudyDateRangeFilter) : null;
  }, [filters]);

  const textChips = useMemo(() => {
    const out: Array<{ id: string; label: string; value: string }> = [];
    for (const f of filters) {
      if (f.id === COLUMN_IDS.MODALITIES || f.id === COLUMN_IDS.STUDY_DATE_TIME) {
        continue;
      }
      if (typeof f.value === 'string' && f.value.trim()) {
        const labels: Record<string, string> = {
          [COLUMN_IDS.PATIENT]: 'Patient',
          [COLUMN_IDS.MRN]: 'MRN',
          [COLUMN_IDS.ACCESSION]: 'Accession',
          [COLUMN_IDS.DESCRIPTION]: 'Description',
        };
        out.push({ id: f.id, label: labels[f.id] ?? f.id, value: f.value.trim() });
      }
    }
    return out;
  }, [filters]);

  const patchFilters = useCallback(
    (mutate: (prev: ColumnFiltersState) => ColumnFiltersState) => {
      onFiltersChange?.(prev => mutate(typeof prev === 'function' ? prev([]) : prev));
    },
    [onFiltersChange]
  );

  const toggleModality = useCallback(
    (mod: string) => {
      patchFilters(prev => {
        const rest = prev.filter(f => f.id !== COLUMN_IDS.MODALITIES);
        const current = prev.find(f => f.id === COLUMN_IDS.MODALITIES);
        const selected = Array.isArray(current?.value)
          ? (current!.value as string[]).map(v => String(v).toUpperCase())
          : [];
        const next = selected.includes(mod)
          ? selected.filter(m => m !== mod)
          : [...selected, mod];
        if (!next.length) {
          return rest;
        }
        return [...rest, { id: COLUMN_IDS.MODALITIES, value: next }];
      });
    },
    [patchFilters]
  );

  const setDatePreset = useCallback(
    (preset: '7' | '30' | 'clear') => {
      patchFilters(prev => {
        const rest = prev.filter(f => f.id !== COLUMN_IDS.STUDY_DATE_TIME);
        if (preset === 'clear') {
          return rest;
        }
        const range = lastNDays(preset === '7' ? 7 : 30);
        return [...rest, { id: COLUMN_IDS.STUDY_DATE_TIME, value: range }];
      });
    },
    [patchFilters]
  );

  const is7 = rangesEqual(dateFilter, lastNDays(7));
  const is30 = rangesEqual(dateFilter, lastNDays(30));
  const hasAny =
    selectedModalities.length > 0 || !!formatDateChip(dateFilter) || textChips.length > 0;

  const chipBase =
    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors';
  const chipIdle =
    'border-[color:var(--border-strong,#2A3A4A)] bg-[color:var(--bg-input,#161E27)] text-[color:var(--text-secondary,#9AA8B6)] hover:border-[color:var(--accent,#2DD4BF)]/50 hover:text-[color:var(--text-primary,#E8EEF4)]';
  const chipActive =
    'border-[color:var(--accent,#2DD4BF)] bg-[color:var(--accent,#2DD4BF)]/15 text-[color:var(--accent,#2DD4BF)] shadow-[0_0_0_1px_rgba(45,212,191,0.25)]';

  return (
    <div
      className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[color:var(--border-subtle,#1E2A36)] bg-[color:var(--bg-elevated,#12181F)]/90 px-4 py-2.5"
      data-chrome="zelvyn-filter-chips"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted,#6B7A8A)]">
        Filters
      </span>

      <div className="bg-border mx-1 hidden h-4 w-px sm:block" />

      <span className="text-[11px] text-[color:var(--text-muted,#6B7A8A)]">Modality</span>
      {QUICK_MODALITIES.map(mod => {
        const active = selectedModalities.includes(mod);
        return (
          <button
            key={mod}
            type="button"
            onClick={() => toggleModality(mod)}
            className={`${chipBase} ${active ? chipActive : chipIdle}`}
            aria-pressed={active}
            aria-label={`Toggle modality ${mod}`}
          >
            {mod}
          </button>
        );
      })}

      <div className="bg-border mx-1 hidden h-4 w-px sm:block" />

      <span className="text-[11px] text-[color:var(--text-muted,#6B7A8A)]">Date</span>
      <button
        type="button"
        onClick={() => setDatePreset(is7 ? 'clear' : '7')}
        className={`${chipBase} ${is7 ? chipActive : chipIdle}`}
        aria-pressed={is7}
      >
        Last 7 days
      </button>
      <button
        type="button"
        onClick={() => setDatePreset(is30 ? 'clear' : '30')}
        className={`${chipBase} ${is30 ? chipActive : chipIdle}`}
        aria-pressed={is30}
      >
        Last 30 days
      </button>
      {dateFilter && !is7 && !is30 && formatDateChip(dateFilter) && (
        <button
          type="button"
          onClick={() => onRemoveFilter(COLUMN_IDS.STUDY_DATE_TIME)}
          className={`${chipBase} ${chipActive}`}
          aria-label="Remove date filter"
        >
          <span className="text-[color:var(--text-secondary,#9AA8B6)]">Date:</span>
          {formatDateChip(dateFilter)}
          <Icons.Close className="h-3 w-3" />
        </button>
      )}

      {textChips.map(chip => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onRemoveFilter(chip.id)}
          className={`${chipBase} ${chipActive}`}
          aria-label={`Remove ${chip.label} filter`}
        >
          <span className="text-[color:var(--text-secondary,#9AA8B6)]">{chip.label}:</span>
          {chip.value}
          <Icons.Close className="h-3 w-3" />
        </button>
      ))}

      <div className="ml-auto flex items-center gap-1">
        {hasAny && (
          <Button
            variant="default"
            size="sm"
            className="h-7 rounded-full bg-[color:var(--accent,#2DD4BF)] px-3 text-xs font-semibold text-[color:var(--text-inverse,#0B0F14)] hover:bg-[color:var(--accent-hover,#5EEAD4)]"
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
