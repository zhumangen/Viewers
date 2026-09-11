import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useModal } from '@ohif/ui-next';
import { useSystem, Types } from '@ohif/core';
import { preserveQueryParameters } from '@ohif/app';
import { ZelvynViewerChrome } from './ZelvynViewerChrome';
import HeaderUndoRedo from './HeaderUndoRedo';

/**
 * Viewer top bar — composes ZelvynViewerChrome (product chrome), not stock OHIF Header.
 * Primary tools live in ZelvynToolRail; secondary in ZelvynToolPill.
 */
function ViewerHeader({ appConfig }: withAppTypes<{ appConfig: AppTypes.Config }>) {
  const { servicesManager, extensionManager } = useSystem();
  const { customizationService } = servicesManager.services;

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

  // Patient meta moves to chrome center (ViewerStudyMeta). Keep undo/redo + any
  // custom right-side items except the default HeaderPatientInfo.
  const rightSideItems =
    customizationService.getCustomization('ohif.headerRightSide')?.items ?? [];

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

  // Prefer explicit undo/redo; fall back to customized right-side list
  // (sites may replace items). Patient info is rendered in chrome center.
  const rightActions =
    rightSideItems.length > 0 ? (
      <>
        {rightSideItems.map((Item, index) => (
          <Item key={index} />
        ))}
      </>
    ) : (
      <HeaderUndoRedo />
    );

  return (
    <ZelvynViewerChrome
      isReturnEnabled={!!appConfig.showStudyList}
      onClickReturnButton={onClickReturnButton}
      menuOptions={menuOptions}
      rightActions={rightActions}
    />
  );
}

export default ViewerHeader;
