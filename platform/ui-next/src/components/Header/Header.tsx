import React, { ReactNode } from 'react';
import classNames from 'classnames';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Icons,
  Button,
  ToolButton,
} from '../';
import { IconPresentationProvider } from '@ohif/ui-next';

import NavBar from '../NavBar';

// Todo: we should move this component to composition and remove props base

interface HeaderProps {
  children?: ReactNode;
  menuOptions: Array<{
    title: string;
    icon?: string;
    onClick: () => void;
  }>;
  isReturnEnabled?: boolean;
  onClickReturnButton?: () => void;
  isSticky?: boolean;
  WhiteLabeling?: {
    createLogoComponentFn?: (React: any, props: any) => ReactNode;
  };
  Secondary?: ReactNode;
  /**
   * Ordered slots filling the right of the menu bar, ahead of the settings
   * menu — patient info, undo/redo, whatever a site puts there. Each is
   * followed by a separator, and a slot whose content renders nothing takes
   * its separator with it.
   */
  RightSide?: ReactNode[];
}

function Header({
  children,
  menuOptions,
  isReturnEnabled = true,
  onClickReturnButton,
  isSticky = false,
  WhiteLabeling,
  RightSide = [],
  Secondary,
  ...props
}: HeaderProps): ReactNode {
  const onClickReturn = () => {
    if (isReturnEnabled && onClickReturnButton) {
      onClickReturnButton();
    }
  };

  return (
    <IconPresentationProvider
      size="large"
      IconContainer={ToolButton}
    >
      <NavBar
        isSticky={isSticky}
        {...props}
      >
        <div className="relative h-11 items-center" data-chrome="zelvyn-viewer-header">
          <div className="absolute left-0 top-1/2 flex -translate-y-1/2 items-center">
            <div
              className={classNames(
                'mr-2 inline-flex items-center gap-1 rounded-md px-1 py-0.5',
                isReturnEnabled && 'hover:bg-accent/30 cursor-pointer'
              )}
              onClick={onClickReturn}
              data-cy="return-to-work-list"
            >
              {isReturnEnabled && <Icons.ArrowLeft className="text-primary ml-0.5 h-4 w-4" />}
              <div className="ml-0.5">
                {WhiteLabeling?.createLogoComponentFn?.(React, props) || <Icons.OHIFLogo />}
              </div>
            </div>
            <span className="bg-primary/15 text-primary ml-1 hidden rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider md:inline">
              Viewer
            </span>
          </div>
          <div className="absolute top-1/2 left-[220px] h-8 -translate-y-1/2">{Secondary}</div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
            <div className="flex items-center justify-center gap-0.5 rounded-lg border border-[color:var(--border-subtle,#1E2A36)] bg-[color:var(--bg-input,#161E27)]/60 px-1 py-0.5">
              {children}
            </div>
          </div>
          <div className="absolute right-0 top-1/2 flex -translate-y-1/2 select-none items-center">
            {RightSide.map((item, index) => (
              // The separator is an `::after` so that `empty:hidden` can drop
              // the whole slot — separator included — when the item rendered
              // nothing (e.g. patient info with `showPatientInfo: 'disabled'`).
              <div
                key={index}
                className="after:border-border flex items-center empty:hidden after:mx-1 after:h-5 after:border-r after:content-['']"
              >
                {item}
              </div>
            ))}
            <div className="flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground h-8 w-8"
                  >
                    <Icons.GearSettings />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {menuOptions.map((option, index) => {
                    const IconComponent = option.icon
                      ? Icons[option.icon as keyof typeof Icons]
                      : null;
                    return (
                      <DropdownMenuItem
                        key={index}
                        onSelect={option.onClick}
                        className="flex items-center gap-2 py-2"
                      >
                        {IconComponent && (
                          <span className="flex h-4 w-4 items-center justify-center">
                            <Icons.ByName name={option.icon} />
                          </span>
                        )}
                        <span className="flex-1">{option.title}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </NavBar>
    </IconPresentationProvider>
  );
}

export default Header;
