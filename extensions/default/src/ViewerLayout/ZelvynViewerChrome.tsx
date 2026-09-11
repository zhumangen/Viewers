import React, { ReactNode } from 'react';
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Icons,
} from '@ohif/ui-next';
import { ViewerStudyMeta } from './ViewerStudyMeta';

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
  /** Extra thin utility icons before settings (e.g. layout) */
  rightActions?: ReactNode;
  modeLabel?: string;
};

/**
 * Zelvyn product chrome — matches viewer-design.png top bar:
 * brand+title | patient+check+study+Basic pills | thin utility icons.
 */
export function ZelvynViewerChrome({
  isReturnEnabled = true,
  onClickReturnButton,
  menuOptions,
  rightActions,
  modeLabel = 'Basic',
}: ZelvynViewerChromeProps) {
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

      <div className="flex shrink-0 items-center gap-0.5">
        {rightActions}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[color:var(--text-secondary,#9AA8B6)] hover:text-[color:var(--accent,#2DD4BF)]"
              aria-label="Settings"
              type="button"
            >
              <Icons.GearSettings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[color:var(--text-secondary,#9AA8B6)] hover:text-[color:var(--accent,#2DD4BF)]"
          aria-label="Help"
          type="button"
          onClick={() => {
            const about = menuOptions.find(o => /about/i.test(o.title));
            about?.onClick();
          }}
        >
          <Icons.Info className="h-4 w-4" />
        </Button>

        {isReturnEnabled ? (
          <>
            <span
              className="mx-0.5 hidden h-5 w-px bg-[color:var(--border-strong,#2A3A4A)] sm:block"
              aria-hidden
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[color:var(--text-secondary,#9AA8B6)] hover:text-[color:var(--accent,#2DD4BF)]"
              onClick={onClickReturnButton}
              data-cy="return-to-work-list"
              aria-label="Exit to worklist"
              type="button"
            >
              <Icons.Cancel className="h-4 w-4" />
            </Button>
          </>
        ) : null}
      </div>
    </header>
  );
}

export default ZelvynViewerChrome;
