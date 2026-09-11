import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Button } from '@ohif/ui-next';
import { useAppConfig } from '@state';
import { ProductBrand } from '../../components/ProductBrand';

const NotFound = ({
  message = "We can't find the page you're looking for.",
  showGoBackButton = true,
}) => {
  const [appConfig] = useAppConfig();
  const { showStudyList } = appConfig;
  const navigate = useNavigate();

  return (
    <div
      className="zelvyn-shell absolute flex h-full w-full flex-col bg-[color:var(--bg-canvas,#0B0F14)]"
      data-shell="zelvyn-notfound"
    >
      <header
        className="relative flex h-12 shrink-0 items-center border-b border-[color:var(--border-subtle,#1E2A36)] bg-[color:var(--bg-elevated,#12181F)] px-4"
        data-chrome="zelvyn-app-bar"
      >
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[color:var(--accent,#2DD4BF)] to-transparent opacity-80"
          aria-hidden
        />
        <ProductBrand variant="full" href="/" />
      </header>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-[color:var(--border-strong,#2A3A4A)] bg-[color:var(--bg-elevated,#12181F)] shadow-[0_8px_28px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-center p-8">
            <img
              src="/assets/zelvyn/logo-mark.png"
              alt=""
              className="h-14 w-14 rounded-lg object-contain opacity-90"
              aria-hidden
            />
          </div>
          <div className="h-px bg-[color:var(--border-subtle,#1E2A36)]" />
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <h1 className="text-[22px] font-semibold text-[color:var(--text-primary,#E8EEF4)]">
              Page not found
            </h1>
            <p className="mt-2 text-[15px] text-[color:var(--text-secondary,#9AA8B6)]">{message}</p>
            {showGoBackButton && showStudyList && (
              <Button
                className="mt-8 bg-[color:var(--accent,#2DD4BF)] px-4 text-[color:var(--text-inverse,#0B0F14)] hover:bg-[color:var(--accent-hover,#5EEAD4)]"
                onClick={() => navigate('/')}
              >
                Return to Worklist
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

NotFound.propTypes = {
  message: PropTypes.string,
  showGoBackButton: PropTypes.bool,
};

export default NotFound;
