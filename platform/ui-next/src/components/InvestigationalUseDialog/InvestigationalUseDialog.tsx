import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Icons } from '@ohif/ui-next';
import { Button } from '../Button';
import { useTranslation } from 'react-i18next';

export enum showDialogOption {
  NeverShowDialog = 'never',
  AlwaysShowDialog = 'always',
  ShowOnceAndConfigure = 'configure',
}

const InvestigationalUseDialog = ({
  dialogConfiguration = {
    option: showDialogOption.AlwaysShowDialog,
  },
}) => {
  const { option, days } = dialogConfiguration;
  const [isHidden, setIsHidden] = useState(true);
  const { t } = useTranslation('InvestigationalUseDialog');

  useEffect(() => {
    const dialogLocalState = localStorage.getItem('investigationalUseDialog');
    const dialogSessionState = sessionStorage.getItem('investigationalUseDialog');

    switch (option) {
      case showDialogOption.NeverShowDialog:
        setIsHidden(true);
        break;
      case showDialogOption.AlwaysShowDialog:
        setIsHidden(!!dialogSessionState);
        break;
      case showDialogOption.ShowOnceAndConfigure:
        if (dialogLocalState) {
          const { expiryDate } = JSON.parse(dialogLocalState);
          const isExpired = new Date() > new Date(expiryDate);
          setIsHidden(!isExpired);
        } else {
          setIsHidden(false);
        }
        break;
      default:
        setIsHidden(true);
    }
  }, [option, days]);

  const handleConfirmAndHide = () => {
    const expiryDate = new Date();

    switch (option) {
      case showDialogOption.ShowOnceAndConfigure:
        expiryDate.setDate(expiryDate.getDate() + days);
        localStorage.setItem('investigationalUseDialog', JSON.stringify({ expiryDate }));
        break;
      case showDialogOption.AlwaysShowDialog:
        sessionStorage.setItem('investigationalUseDialog', 'hidden');
        break;
    }
    setIsHidden(true);
  };

  if (isHidden) {
    return null;
  }

  // Minimized chrome banner — required investigational notice retained.
  return (
    <div className="pointer-events-none fixed bottom-3 z-50 flex w-full justify-center px-3">
      <div className="bg-card/95 border-border pointer-events-auto flex max-w-3xl flex-1 items-center justify-between gap-3 rounded-md border px-3 py-2 shadow-lg backdrop-blur-sm">
        <div className="flex min-w-0 items-center gap-2.5">
          <Icons.InvestigationalUse className="text-muted-foreground h-8 w-8 shrink-0 opacity-80" />
          <div className="flex min-w-0 flex-col">
            <div className="text-foreground text-sm leading-snug">
              This viewer is{' '}
              <span className="text-highlight font-medium">{t('for investigational use only')}</span>
            </div>
            <div className="text-muted-foreground truncate text-xs">
              <span
                className="text-primary cursor-pointer hover:underline"
                onClick={() => window.open('https://ohif.org/', '_blank')}
              >
                {t('Learn more about OHIF Viewer')}
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary shrink-0"
          onClick={handleConfirmAndHide}
          dataCY="confirm-and-hide-button"
        >
          {t('Confirm and hide')}
        </Button>
      </div>
    </div>
  );
};

InvestigationalUseDialog.propTypes = {
  dialogConfiguration: PropTypes.shape({
    option: PropTypes.oneOf(Object.values(showDialogOption)).isRequired,
    days: PropTypes.number,
  }),
};

export default InvestigationalUseDialog;
