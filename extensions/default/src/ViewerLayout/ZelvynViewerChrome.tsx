import React, { useState } from 'react';
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Icons,
} from '@ohif/ui-next';
import { ViewerStudyMeta } from './ViewerStudyMeta';
import { ZelvynLayoutPicker } from './ZelvynLayoutPicker';

const BRAND_NAME = 'Zelvyn';
const LOGO_MARK_SRC = '/assets/zelvyn/logo-mark.png';

type MenuOption = {
  title: string;
  icon?: string;
  onClick: () => void;
};

type ZelvynViewerChromeProps = {
  isReturnEnabled?: boolean;
  onClickReturnButton?: () => void;
  menuOptions: MenuOption[];
  modeLabel?: string;
  onSelectLayout?: (layout: { numRows: number; numCols: number }) => void;
  onHangingProtocol?: () => void;
  studyDateLabel?: string;
};

const thinIconBtn =
  'h-8 w-8 text-[color:var(--text-secondary,#9AA8B6)] hover:text-[color:var(--accent,#2DD4BF)]';

/** Thin-line SVGs matching mockup utility row. */
function IconMonitor({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="12"
        rx="1.5"
      />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

function IconHanger({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 5a2 2 0 1 0-2 2" />
      <path d="M12 7v2.5L4.5 16.5A2.2 2.2 0 0 0 6 20h12a2.2 2.2 0 0 0 1.5-3.5L12 9.5" />
    </svg>
  );
}

function IconCalendar({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2"
      />
      <path d="M8 3.5v3M16 3.5v3M3.5 10h17" />
    </svg>
  );
}

function IconHelp({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.7 2.2c-.8.4-1.2.9-1.2 1.8" />
      <circle
        cx="12"
        cy="17"
        r="0.75"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

/**
 * Zelvyn product chrome — mockup top bar:
 * brand+title | patient+check+study+Basic pills | monitor·hanger·calendar·⚙·?·⏻
 */
export function ZelvynViewerChrome({
  isReturnEnabled = true,
  onClickReturnButton,
  menuOptions,
  modeLabel = 'Basic',
  onSelectLayout,
  onHangingProtocol,
  studyDateLabel,
}: ZelvynViewerChromeProps) {
  const aboutOption = menuOptions.find(o => /about/i.test(o.title));
  const [layoutOpen, setLayoutOpen] = useState(false);

  return (
    <header
      className="relative z-30 flex h-11 shrink-0 items-center gap-3 border-b border-[color:var(--border-subtle,#1E2A36)] bg-[color:var(--bg-elevated,#12181F)] px-3"
      data-chrome="zelvyn-viewer-chrome"
    >
      <div className="flex min-w-0 shrink-0 items-center gap-2">
        <a
          href="/"
          className="inline-flex items-center gap-2 no-underline hover:opacity-90"
          aria-label={BRAND_NAME}
          data-brand={BRAND_NAME}
          onClick={e => {
            if (isReturnEnabled && onClickReturnButton) {
              e.preventDefault();
              onClickReturnButton();
            }
          }}
        >
          <img
            src={LOGO_MARK_SRC}
            alt=""
            className="h-7 w-7 shrink-0 rounded-md object-contain"
            aria-hidden
          />
          <span className="flex flex-col leading-none">
            <span className="text-[13px] font-semibold tracking-tight text-[color:var(--text-primary,#E8EEF4)]">
              {BRAND_NAME}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-[color:var(--text-muted,#6B7A8A)]">
              Viewer
            </span>
          </span>
        </a>
      </div>

      <span
        className="hidden h-5 w-px shrink-0 bg-[color:var(--border-strong,#2A3A4A)] sm:block"
        aria-hidden
      />

      <div className="flex min-w-0 flex-1 items-center px-1">
        <ViewerStudyMeta modeLabel={modeLabel} />
      </div>

      <div
        className="zelvyn-header-utils flex shrink-0 items-center gap-0.5"
        data-chrome="zelvyn-header-utils"
      >
        {/* Monitor / display layout */}
        <DropdownMenu open={layoutOpen} onOpenChange={setLayoutOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={thinIconBtn}
              aria-label="Viewport layout"
              type="button"
              title="Layout"
            >
              <IconMonitor />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="zelvyn-layout-menu border-[color:var(--border-subtle,#1E2A36)] bg-[color:var(--bg-elevated,#12181F)] p-0 shadow-xl"
            onCloseAutoFocus={e => e.preventDefault()}
          >
            <ZelvynLayoutPicker onAfterSelect={() => setLayoutOpen(false)} />
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Hanger — hanging protocols */}
        <Button
          variant="ghost"
          size="icon"
          className={thinIconBtn}
          aria-label="Hanging protocols"
          type="button"
          title="Hanging protocols"
          onClick={() => onHangingProtocol?.()}
        >
          <IconHanger />
        </Button>

        {/* Calendar — study date */}
        <Button
          variant="ghost"
          size="icon"
          className={thinIconBtn}
          aria-label={studyDateLabel ? `Study date ${studyDateLabel}` : 'Study date'}
          type="button"
          title={studyDateLabel || 'Study date'}
        >
          <IconCalendar />
        </Button>

        <span
          className="mx-0.5 hidden h-5 w-px bg-[color:var(--border-strong,#2A3A4A)] sm:block"
          aria-hidden
        />

        {/* Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={thinIconBtn}
              aria-label="Settings"
              type="button"
              title="Settings"
            >
              <Icons.GearSettings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border-[color:var(--border-subtle,#1E2A36)] bg-[color:var(--bg-elevated,#12181F)] text-[color:var(--text-primary,#E8EEF4)]"
          >
            {menuOptions.map((option, index) => (
              <DropdownMenuItem
                key={index}
                onSelect={option.onClick}
                className="flex items-center gap-2 py-2"
              >
                {option.icon ? (
                  <span className="flex h-4 w-4 items-center justify-center">
                    <Icons.ByName name={option.icon} />
                  </span>
                ) : null}
                <span className="flex-1">{option.title}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help */}
        <Button
          variant="ghost"
          size="icon"
          className={thinIconBtn}
          aria-label="Help"
          type="button"
          title="Help"
          onClick={() => aboutOption?.onClick()}
        >
          <IconHelp />
        </Button>

        <span
          className="mx-0.5 hidden h-5 w-px bg-[color:var(--border-strong,#2A3A4A)] sm:block"
          aria-hidden
        />

        {/* Exit / power */}
        {isReturnEnabled ? (
          <Button
            variant="ghost"
            size="icon"
            className={thinIconBtn}
            onClick={onClickReturnButton}
            data-cy="return-to-work-list"
            aria-label="Exit to worklist"
            type="button"
            title="Exit"
          >
            <Icons.PowerOff className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </header>
  );
}

export default ZelvynViewerChrome;
