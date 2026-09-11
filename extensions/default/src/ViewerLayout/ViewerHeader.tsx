import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useModal } from '@ohif/ui-next';
import { useSystem, Types } from '@ohif/core';
import { preserveQueryParameters } from '@ohif/app';
import { ZelvynViewerChrome } from './ZelvynViewerChrome';
import usePatientInfo from '../hooks/usePatientInfo';

/**
 * Viewer top bar — ZelvynViewerChrome with mockup utility icons.
 * Primary tools live in ZelvynToolRail (+ More overflow).
 */
function ViewerHeader({ appConfig }: withAppTypes<{ appConfig: AppTypes.Config }>) {
  const { servicesManager, extensionManager, commandsManager } = useSystem();
  const { customizationService, hangingProtocolService } = servicesManager.services;
  const { patientInfo } = usePatientInfo();

  const navigate = useNavigate();
  const location = useLocation();

  const onClickReturnButton = () => {
    const { pathname } = location;
    const dataSourceIdx = pathname.indexOf('/', 1);

    const dataSourceName = pathname.substring(dataSourceIdx + 1);
    const existingDataSource = extensionManager.getDataSources(dataSourceName);

    const searchQuery = new URLSearchParams();
    if (dataSourceIdx !== -1 && existingDataSource) {
      searchQuery.append('datasources', pathname.substring(dataSourceIdx + 1));
    }
    preserveQueryParameters(searchQuery, customizationService);

    navigate({
      pathname: '/',
      search: decodeURIComponent(searchQuery.toString()),
    });
  };

  const { t } = useTranslation();
  const { show } = useModal();

  const AboutModal = customizationService.getCustomization(
    'ohif.aboutModal'
  ) as Types.MenuComponentCustomization;

  const AppearanceModal = customizationService.getCustomization(
    'ohif.appearanceModal'
  ) as Types.MenuComponentCustomization;

  const UserPreferencesModal = customizationService.getCustomization(
    'ohif.userPreferencesModal'
  ) as Types.MenuComponentCustomization;

  const menuOptions = [
    {
      title: AboutModal?.menuTitle ?? t('Header:About'),
      icon: 'info',
      onClick: () =>
        show({
          content: AboutModal,
          title: AboutModal?.title ?? t('AboutModal:About'),
          containerClassName: AboutModal?.containerClassName ?? 'max-w-md',
        }),
    },
    {
      title: UserPreferencesModal.menuTitle ?? t('Header:Preferences'),
      icon: 'settings',
      onClick: () =>
        show({
          content: UserPreferencesModal,
          title: UserPreferencesModal.title ?? t('UserPreferencesModal:User preferences'),
          containerClassName:
            UserPreferencesModal?.containerClassName ?? 'flex max-w-4xl p-6 flex-col',
        }),
    },
  ];

  if (AppearanceModal) {
    menuOptions.splice(1, 0, {
      title: AppearanceModal.menuTitle ?? t('Header:Appearance'),
      icon: 'ColorChange',
      onClick: () =>
        show({
          content: AppearanceModal,
          title: AppearanceModal.title ?? t('AppearanceModal:Appearance'),
          containerClassName: AppearanceModal.containerClassName ?? 'max-w-md',
        }),
    });
  }

  if (appConfig.oidc) {
    menuOptions.push({
      title: t('Header:Logout'),
      icon: 'power-off',
      onClick: async () => {
        navigate(`/logout?redirect_uri=${encodeURIComponent(window.location.href)}`);
      },
    });
  }

  const onSelectLayout = ({ numRows, numCols }: { numRows: number; numCols: number }) => {
    commandsManager.run('setViewportGridLayout', { numRows, numCols });
  };

  const onHangingProtocol = () => {
    // Cycle / toggle common stage when available; otherwise no-op safely.
    try {
      const protocols = hangingProtocolService?.getProtocols?.() || [];
      if (protocols.length && commandsManager) {
        commandsManager.run('toggleHangingProtocol', {});
      }
    } catch {
      // Hanging protocol UI may be mode-specific; icon remains for chrome parity.
    }
  };

  return (
    <ZelvynViewerChrome
      isReturnEnabled={!!appConfig.showStudyList}
      onClickReturnButton={onClickReturnButton}
      menuOptions={menuOptions}
      modeLabel="Basic"
      onSelectLayout={onSelectLayout}
      onHangingProtocol={onHangingProtocol}
      studyDateLabel={patientInfo.StudyDate || undefined}
    />
  );
}

export default ViewerHeader;
