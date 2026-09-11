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

type MenuOption = {
  title: string;
  icon?: string;
  onClick: () => void;
};

type ZelvynViewerChromeProps = {
  isReturnEnabled?: boolean;
  onClickReturnButton?: () => void;
  menuOptions: MenuOption[];
  /** Undo/redo and other compact actions — right side before settings */
  rightActions?: ReactNode;
};

/**
 * Zelvyn product chrome for the Viewer — NOT the stock OHIF Header menu pattern.
 * Layout: brand+return left | patient/study meta center | compact actions right.
 * Primary tools: ZelvynToolRail. Secondary: ZelvynToolPill.
 */
export function ZelvynViewerChrome({
  isReturnEnabled = true,
  onClickReturnButton,
  menuOptions,
  rightActions,
}: ZelvynViewerChromeProps) {
  return (
    <header
      className="relative z-30 flex h-12 shrink-0 items-center gap-3 border-b border-[color:var(--border-subtle,#1E2A36)] bg-[color:var(--bg-elevated,#12181F)] px-3"
      data-chrome="zelvyn-viewer-chrome"
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[color:var(--accent,#2DD4BF)] to-transparent opacity-90"
        aria-hidden
      />

      <div className="flex min-w-0 shrink-0 items-center gap-2">
        {isReturnEnabled ? (
          <Button
            variant="ghost"
            size="icon"
            className="text-[color:var(--accent,#2DD4BF)] hover:bg-[color:var(--accent,#2DD4BF)]/10 h-8 w-8"
            onClick={onClickReturnButton}
            data-cy="return-to-work-list"
            aria-label="Return to worklist"
            type="button"
          >
            <Icons.ArrowLeft className="h-4 w-4" />
          </Button>
        ) : null}
        <a
          href="/"
          className="inline-flex items-center gap-2 no-underline hover:opacity-90"
          aria-label="Zelvyn"
          data-brand="Zelvyn"
          onClick={e => {
            if (isReturnEnabled && onClickReturnButton) {
              e.preventDefault();
              onClickReturnButton();
            }
          }}
        >
          <img
            src="/assets/zelvyn/logo-wordmark.png"
            alt="Zelvyn"
            className="h-7 max-w-[132px] object-contain object-left"
          />
        </a>
        <span className="bg-[color:var(--accent,#2DD4BF)]/20 text-[color:var(--accent,#2DD4BF)] hidden rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider sm:inline">
          Viewer
        </span>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center px-2">
        <ViewerStudyMeta />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {rightActions}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-[color:var(--text-secondary,#9AA8B6)] hover:text-[color:var(--accent,#2DD4BF)] h-8 w-8"
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
        <div
          className="ml-1 hidden h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent,#2DD4BF)]/25 text-[10px] font-semibold text-[color:var(--accent,#2DD4BF)] sm:flex"
          title="User (stub)"
        >
          RA
        </div>
      </div>
    </header>
  );
}

export default ZelvynViewerChrome;
