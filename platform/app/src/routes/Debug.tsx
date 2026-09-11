import React from 'react';
import { Icons } from '@ohif/ui-next';
import { ProductBrand } from '../components/ProductBrand';

// Debug component listing COOP/COEP and similar runtime facts.
function Debug() {
  return (
    <div
      className="zelvyn-shell"
      data-shell="zelvyn-debug"
      style={{ width: '100%', height: '100%' }}
    >
      <div className="flex h-screen w-screen items-center justify-center bg-[color:var(--bg-canvas,#0B0F14)]">
        <div className="mx-auto space-y-2 rounded-xl border border-[color:var(--border-strong,#2A3A4A)] bg-[color:var(--bg-elevated,#12181F)] px-8 py-8 shadow-[0_8px_28px_rgba(0,0,0,0.45)]">
          <div className="flex justify-center">
            <ProductBrand variant="full" href="" />
          </div>
          <div className="space-y-2 pt-4 text-center">
            <div className="flex flex-col items-center justify-center">
              <p className="mt-4 text-xl font-semibold text-[color:var(--accent,#2DD4BF)]">
                Debug Information
              </p>
              <div className="mt-4 flex items-center space-x-2">
                <p className="text-md text-[color:var(--text-primary,#E8EEF4)]">
                  Cross Origin Isolated (COOP/COEP)
                </p>
                <Icons.ByName
                  name={
                    window.crossOriginIsolated ? 'notifications-success' : 'notifications-error'
                  }
                  className="h-5 w-5"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Debug;
