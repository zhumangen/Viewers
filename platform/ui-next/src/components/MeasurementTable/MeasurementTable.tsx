import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Icons, PanelSection, Tooltip, TooltipContent, TooltipTrigger } from '../../index';
import DataRow from '../DataRow/DataRow';
import { createContext } from '../../lib/createContext';
import { cn } from '../../lib/utils';

interface MeasurementTableContext {
  data?: any[];
  onAction?: (e, command: string | string[], uid: string) => void;
  disableEditing?: boolean;
  isExpanded: boolean;
}

const [MeasurementTableProvider, useMeasurementTableContext] =
  createContext<MeasurementTableContext>('MeasurementTable', { data: [], isExpanded: true });

interface MeasurementDataProps extends MeasurementTableContext {
  title: string;
  children: React.ReactNode;
}

type SeriesGroup = {
  key: string;
  label: string;
  meta?: string;
  items: MeasurementItem[];
};

const MeasurementTable = ({
  data = [],
  onAction,
  isExpanded = true,
  title,
  children,
  disableEditing = false,
}: MeasurementDataProps) => {
  const { t } = useTranslation('MeasurementTable');
  const amount = data.length;

  return (
    <MeasurementTableProvider
      data={data}
      onAction={onAction}
      isExpanded={isExpanded}
      disableEditing={disableEditing}
    >
      <PanelSection defaultOpen={true}>
        <PanelSection.Header
          key="measurementTableHeader"
          className="bg-bkg-med border-border text-muted-foreground"
        >
          <span className="text-[13px] font-medium tracking-wide">{`${t(title)} (${amount})`}</span>
        </PanelSection.Header>
        <PanelSection.Content key="measurementTableContent">{children}</PanelSection.Content>
      </PanelSection>
    </MeasurementTableProvider>
  );
};

const Header = ({ children }: { children: React.ReactNode }) => {
  return <div className="measurement-table-header">{children}</div>;
};

function groupBySeries(data: MeasurementItem[]): SeriesGroup[] {
  const groups = new Map<string, SeriesGroup>();

  data.forEach(item => {
    const key = item.seriesGroupKey || item.referenceSeriesUID || item.displaySetInstanceUID || '_default';
    const label = item.seriesGroupLabel || 'Series';
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label,
        meta: item.seriesGroupMeta,
        items: [],
      });
    }
    groups.get(key)!.items.push(item);
  });

  return Array.from(groups.values());
}

const Body = () => {
  const { data } = useMeasurementTableContext('MeasurementTable.Body');
  const { t } = useTranslation('MeasurementTable');

  const groups = useMemo(() => (data?.length ? groupBySeries(data) : []), [data]);
  const showSeriesGroups = groups.length > 1 || (groups.length === 1 && groups[0].key !== '_default');

  if (!data || data.length === 0) {
    return (
      <div
        className="text-muted-foreground flex flex-1 flex-col gap-1 px-3 py-4 text-[13px] leading-5"
        data-cy="measurement-table-empty"
      >
        <span className="text-foreground/90 font-medium">{t('No tracked measurements')}</span>
        <span className="text-muted-foreground text-xs">
          Choose Length / Bidirectional (or other tools) from the toolbar to add measurements.
        </span>
      </div>
    );
  }

  return (
    <div className="measurement-table-body space-y-1">
      {showSeriesGroups && (
        <div className="text-muted-foreground px-2.5 pt-2 pb-0.5 text-[11px] font-medium tracking-wider uppercase">
          Group by series
        </div>
      )}
      {groups.map(group => (
        <div
          key={group.key}
          className="border-border/60 overflow-hidden border-b last:border-b-0"
          data-cy="measurement-series-group"
        >
          {showSeriesGroups && (
            <div className="bg-bkg-med/80 text-foreground flex items-center justify-between gap-2 px-2.5 py-1.5">
              <span className="truncate text-[12px] font-medium leading-4">{group.label}</span>
              <span className="text-muted-foreground shrink-0 text-[11px]">
                {group.meta || `${group.items.length}`}
              </span>
            </div>
          )}
          <div className="space-y-px">
            {group.items.map((item, index) => (
              <Row
                key={item.uid}
                item={item}
                index={index}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const Footer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn('measurement-table-footer border-border bg-bkg-med sticky bottom-0 z-[1] border-t', className)}>
      {children}
    </div>
  );
};

interface MeasurementItem {
  uid: string;
  label: string;
  colorHex: string;
  isSelected: boolean;
  displayText: { primary: string[]; secondary: string[] };
  isVisible: boolean;
  isLocked: boolean;
  toolName: string;
  isExpanded: boolean;
  isUnmapped?: boolean;
  statusTooltip?: string;
  isTracked?: boolean;
  referenceSeriesUID?: string;
  displaySetInstanceUID?: string;
  seriesGroupKey?: string;
  seriesGroupLabel?: string;
  seriesGroupMeta?: string;
}

interface RowProps {
  item: MeasurementItem;
  index: number;
}

const Row = ({ item, index }: RowProps) => {
  const { onAction, disableEditing } = useMeasurementTableContext('MeasurementTable.Row');
  const { t } = useTranslation('MeasurementTable');
  const { uid } = item;

  const statusNode = item.isUnmapped ? (
    <DataRow.Status.Warning tooltip={item.statusTooltip} />
  ) : item.isTracked === true ? (
    <Badge
      variant="success"
      className="rounded-full px-1.5 py-0 text-[10px] uppercase tracking-wide"
      data-cy="measurement-status-tracked"
    >
      Tracked
    </Badge>
  ) : item.isTracked === false ? (
    <Badge
      variant="muted"
      className="rounded-full px-1.5 py-0 text-[10px] uppercase tracking-wide"
      data-cy="measurement-status-untracked"
    >
      Untracked
    </Badge>
  ) : null;

  const jumpAction = (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="text-muted-foreground hover:text-primary h-6 w-auto gap-1 px-1 opacity-80 transition-opacity group-hover:opacity-100"
          dataCY={`jump-to-measurement-${index}`}
          aria-label={t('Jump to image', { defaultValue: 'Jump to image' })}
          onClick={e => {
            e.stopPropagation();
            onAction?.(e, 'jumpToMeasurement', uid);
          }}
        >
          <Icons.JumpToSlice className="h-4 w-4" />
          <span className="text-[11px] font-medium pr-0.5">
            {t('Jump', { defaultValue: 'Jump' })}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <div>{t('Jump to image', { defaultValue: 'Jump to image' })}</div>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <div
      data-cy={`measurement-table-row-${index}`}
      className="group/measurement"
    >
      <DataRow
        key={item.uid}
        description={item.label}
        number={index + 1}
        title={item.label}
        colorHex={item.colorHex}
        isSelected={item.isSelected}
        details={item.displayText}
        onDelete={e => onAction?.(e, 'removeMeasurement', uid)}
        onSelect={e => onAction?.(e, 'jumpToMeasurement', uid)}
        onRename={e => onAction?.(e, 'renameMeasurement', uid)}
        onToggleVisibility={e => onAction?.(e, 'toggleVisibilityMeasurement', uid)}
        onToggleLocked={e => onAction?.(e, 'toggleLockMeasurement', uid)}
        onColor={e => onAction?.(e, 'changeMeasurementColor', uid)}
        disableEditing={disableEditing}
        isVisible={item.isVisible}
        isLocked={item.isLocked}
        className={cn(item.isSelected && 'bg-row-selected')}
        trailingActions={jumpAction}
      >
        {statusNode}
      </DataRow>
    </div>
  );
};

MeasurementTable.Header = Header;
MeasurementTable.Body = Body;
MeasurementTable.Footer = Footer;
MeasurementTable.Row = Row;

export default MeasurementTable;
