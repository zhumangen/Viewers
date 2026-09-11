import * as React from 'react';
import { Icons } from '../../Icons';

type Series = {
  seriesInstanceUid?: string;
  SeriesInstanceUID?: string;
  modality?: string;
  Modality?: string;
  description?: string;
  SeriesDescription?: string;
  seriesNumber?: number | string;
  SeriesNumber?: number | string;
  numSeriesInstances?: number;
  numInstances?: number;
};

type PreviewSeriesListProps = {
  series: Series[];
  onSeriesClick?: (series: Series) => void;
};

export function PreviewSeriesList({ series, onSeriesClick }: PreviewSeriesListProps) {
  if (!series?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[color:var(--border-strong,#2A3A4A)] px-3 py-8 text-center">
        <Icons.Series className="h-8 w-8 text-[color:var(--text-muted,#6B7A8A)] opacity-60" />
        <div className="text-sm font-medium text-[color:var(--text-secondary,#9AA8B6)]">
          No series loaded
        </div>
        <div className="text-xs text-[color:var(--text-muted,#6B7A8A)]">
          Select a study to preview series
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-1.5 px-0.5" data-chrome="zelvyn-series-cards">
      <div className="mb-1 flex items-center justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted,#6B7A8A)]">
          Series
        </span>
        <span className="rounded-full bg-[color:var(--accent,#2DD4BF)]/20 px-2 py-0.5 text-[11px] font-semibold text-[color:var(--accent,#2DD4BF)]">
          {series.length}
        </span>
      </div>
      {series.map((s, idx) => {
        const seriesUID = s.seriesInstanceUid || s.SeriesInstanceUID || String(idx);
        const modality = String(s.modality || s.Modality || '').toUpperCase();
        const description = s.description || s.SeriesDescription || '';
        const numInstances = s.numSeriesInstances ?? s.numInstances ?? 0;
        const seriesNumber = s.seriesNumber ?? s.SeriesNumber ?? idx + 1;

        return (
          <button
            key={seriesUID}
            type="button"
            onClick={() => onSeriesClick?.(s)}
            className="group flex w-full items-center gap-2.5 rounded-md border border-[color:var(--border-subtle,#1E2A36)] bg-[color:var(--bg-elevated,#12181F)] px-2.5 py-2 text-left transition-colors hover:border-[color:var(--accent,#2DD4BF)]/50 hover:bg-[color:var(--accent,#2DD4BF)]/8"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[color:var(--accent,#2DD4BF)]/15 text-xs font-bold text-[color:var(--accent,#2DD4BF)]">
              {modality || '#'}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-[color:var(--text-primary,#E8EEF4)]">
                {seriesNumber}. {description || '(no description)'}
              </div>
              <div className="text-[11px] text-[color:var(--text-muted,#6B7A8A)]">
                {numInstances} images
              </div>
            </div>
            <Icons.ChevronRight className="h-4 w-4 text-[color:var(--text-muted,#6B7A8A)] opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        );
      })}
    </div>
  );
}
