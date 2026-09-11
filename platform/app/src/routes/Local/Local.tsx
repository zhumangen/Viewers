import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DicomMetadataStore, MODULE_TYPES, useSystem } from '@ohif/core';

import Dropzone from 'react-dropzone';
import filesToStudies from './filesToStudies';

import { extensionManager } from '../../App';

import { Button, Icons } from '@ohif/ui-next';
import { ProductBrand } from '../../components/ProductBrand';

const getLoadButton = (onDrop, text, isDir) => {
  return (
    <Dropzone
      onDrop={onDrop}
      noDrag
    >
      {({ getRootProps, getInputProps }) => (
        <div {...getRootProps()}>
          <Button
            variant="default"
            className="bg-[color:var(--accent,#2DD4BF)] text-[color:var(--text-inverse,#0B0F14)] hover:bg-[color:var(--accent-hover,#5EEAD4)] w-32 font-semibold"
            disabled={false}
            onClick={() => {}}
          >
            {text}
            {isDir ? (
              <input
                {...getInputProps()}
                webkitdirectory="true"
                mozdirectory="true"
                style={{ display: 'none' }}
              />
            ) : (
              <input
                {...getInputProps()}
                style={{ display: 'none' }}
              />
            )}
          </Button>
        </div>
      )}
    </Dropzone>
  );
};

type LocalProps = {
  modePath: string;
};

function Local({ modePath }: LocalProps) {
  const { servicesManager } = useSystem();
  const { customizationService } = servicesManager.services;
  const navigate = useNavigate();
  const dropzoneRef = useRef();
  const [dropInitiated, setDropInitiated] = React.useState(false);

  const LoadingIndicatorProgress = customizationService.getCustomization(
    'ui.loadingIndicatorProgress'
  );

  const dataSourceModules = extensionManager.modules[MODULE_TYPES.DATA_SOURCE];
  const localDataSources = dataSourceModules.reduce((acc, curr) => {
    const mods = [];
    curr.module.forEach(mod => {
      if (mod.type === 'localApi') {
        mods.push(mod);
      }
    });
    return acc.concat(mods);
  }, []);

  const firstLocalDataSource = localDataSources[0];
  const dataSource = firstLocalDataSource.createDataSource({});

  const microscopyExtensionLoaded = extensionManager.registeredExtensionIds.includes(
    '@ohif/extension-dicom-microscopy'
  );

  const onDrop = async acceptedFiles => {
    const studies = await filesToStudies(acceptedFiles, dataSource);

    const query = new URLSearchParams();

    if (microscopyExtensionLoaded) {
      const smStudies = studies.filter(id => {
        const study = DicomMetadataStore.getStudy(id);
        return (
          study.series.findIndex(s => s.Modality === 'SM' || s.instances[0].Modality === 'SM') >= 0
        );
      });

      if (smStudies.length > 0) {
        smStudies.forEach(id => query.append('StudyInstanceUIDs', id));

        modePath = 'microscopy';
      }
    }

    studies.forEach(id => query.append('StudyInstanceUIDs', id));
    query.append('datasources', 'dicomlocal');

    navigate(`/${modePath}?${decodeURIComponent(query.toString())}`);
  };

  useEffect(() => {
    document.body.classList.add('bg-background');
    return () => {
      document.body.classList.remove('bg-background');
    };
  }, []);

  return (
    <Dropzone
      ref={dropzoneRef}
      onDrop={acceptedFiles => {
        setDropInitiated(true);
        onDrop(acceptedFiles);
      }}
      noClick
    >
      {({ getRootProps }) => (
        <div
          {...getRootProps()}
          className="zelvyn-shell h-full w-full"
          data-shell="zelvyn-local"
          style={{ width: '100%', height: '100%' }}
        >
          <header
            className="relative flex h-12 items-center border-b border-[color:var(--border-subtle,#1E2A36)] bg-[color:var(--bg-elevated,#12181F)] px-4"
            data-chrome="zelvyn-app-bar"
          >
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[color:var(--accent,#2DD4BF)] to-transparent opacity-80"
              aria-hidden
            />
            <ProductBrand variant="full" />
            <span className="bg-[color:var(--accent,#2DD4BF)]/20 text-[color:var(--accent,#2DD4BF)] ml-2 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              Local upload
            </span>
            <div className="ml-auto">
              <Button
                variant="ghost"
                className="text-[color:var(--text-secondary,#9AA8B6)] hover:text-[color:var(--accent,#2DD4BF)] text-sm"
                onClick={() => navigate('/')}
                type="button"
              >
                Worklist
              </Button>
            </div>
          </header>
          <div className="flex h-[calc(100vh-48px)] w-screen items-center justify-center bg-[color:var(--bg-canvas,#0B0F14)]">
            <div className="mx-auto space-y-2 rounded-xl border border-dashed border-[color:var(--accent,#2DD4BF)]/50 bg-[color:var(--bg-elevated,#12181F)] px-12 py-12 shadow-[0_8px_28px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-center">
                <img
                  src="/assets/zelvyn/logo-mark.png"
                  alt=""
                  className="h-16 w-16 rounded-lg object-contain"
                  aria-hidden
                />
              </div>
              <div className="space-y-2 py-6 text-center">
                {dropInitiated ? (
                  <div className="flex flex-col items-center justify-center pt-12">
                    <LoadingIndicatorProgress className={'h-full w-full bg-background'} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="pt-0 text-xl text-[color:var(--text-primary,#E8EEF4)]">
                      Drag and drop your DICOM files & folders here <br />
                      to load them locally.
                    </p>
                    <p className="text-base text-[color:var(--text-muted,#6B7A8A)]">
                      Note: Your data remains locally within your browser
                      <br /> and is never uploaded to any server.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-2 pt-4">
                {getLoadButton(onDrop, 'Load files', false)}
                {getLoadButton(onDrop, 'Load folders', true)}
              </div>
            </div>
          </div>
        </div>
      )}
    </Dropzone>
  );
}

export default Local;
