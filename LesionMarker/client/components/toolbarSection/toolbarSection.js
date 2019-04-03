import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { OHIF } from 'meteor/ohif:core';
import { Viewerbase } from 'meteor/jf:viewerbase';

Template.toolbarSection.helpers({
  leftSidebarToggleButtonData() {
    const instance = Template.instance();
    return {
      toggleable: true,
      key: 'leftSidebar',
      value: instance.data.state,
      options: [{
        value: 'report',
        svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-studies',
        svgWidth: 15,
        svgHeight: 13,
        bottomLabel: '检查'
      }]
    };
  },

  rightSidebarToggleButtonData() {
    const instance = Template.instance();
    return {
      toggleable: true,
      key: 'rightSidebar',
      value: instance.data.state,
      options: [{
        value: 'measurements',
        svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-measurements-lesions',
        svgWidth: 18,
        svgHeight: 10,
        bottomLabel: '标注'
      }]
    };
  },

  toolbarButtons() {
    // Check if the measure tools shall be disabled
    const isToolDisabled = false; //!Template.instance().data.timepointApi;

    const targetSubTools = [];

    targetSubTools.push({
      id: 'targetRect',
      title: '矩形',
      classes: 'imageViewerTool',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-measure-target-un',
      disabled: isToolDisabled
    });

    targetSubTools.push({
      id: 'targetEllipse',
      title: '椭圆',
      classes: 'imageViewerTool',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-measure-target-cr',
      disabled: isToolDisabled
    });

    targetSubTools.push({
      id: 'bidirectional',
      title: '双直线',
      classes: 'imageViewerTool rm-l-3',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-measure-target',
      disabled: isToolDisabled
    });

    /*
    targetSubTools.push({
      id: 'targetProbe',
      title: '探针',
      classes: 'imageViewerTool',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-measure-target-un',
      disabled: isToolDisabled
    });
    */
    targetSubTools.push({
      id: 'targetPencil',
      title: '画笔',
      classes: 'imageViewerTool',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-measure-target-cr',
      disabled: isToolDisabled
    });
  /*
    targetSubTools.push({
      id: 'targetCR',
      title: 'CR Target',
      classes: 'imageViewerTool',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-measure-target-cr',
      disabled: isToolDisabled
    });

    targetSubTools.push({
      id: 'targetUN',
      title: 'UN Target',
      classes: 'imageViewerTool',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-measure-target-un',
      disabled: isToolDisabled
    });
  */
    const extraTools = [];

    extraTools.push({
      id: 'stackScroll',
      title: '翻页',
      classes: 'imageViewerTool',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-stack-scroll'
    });

    extraTools.push({
      id: 'resetViewport',
      title: '重置',
      classes: 'imageViewerCommand',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-reset'
    });

    extraTools.push({
      id: 'rotateR',
      title: '旋转',
      classes: 'imageViewerCommand',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-rotate-right'
    });

    extraTools.push({
      id: 'flipH',
      title: '左右翻转',
      classes: 'imageViewerCommand',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-flip-horizontal'
    });

    extraTools.push({
      id: 'flipV',
      title: '上下翻转',
      classes: 'imageViewerCommand',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-flip-vertical'
    });

    extraTools.push({
      id: 'invert',
      title: '负相',
      classes: 'imageViewerCommand',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-invert'
    });

    extraTools.push({
      id: 'magnify',
      title: '放大镜',
      classes: 'imageViewerTool',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-magnify'
    });

    extraTools.push({
      id: 'ellipticalRoi',
      title: '椭圆',
      classes: 'imageViewerTool',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-elliptical-roi'
    });

    extraTools.push({
      id: 'length',
      title: '直线',
      classes: 'imageViewerTool',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-measure-temp'
    });

    extraTools.push({
      id: 'toggleDownloadDialog',
      title: '下载',
      classes: 'imageViewerCommand',
      iconClasses: 'fa fa-camera',
      active: () => $('#imageDownloadDialog').is(':visible')
    });

    extraTools.push({
      id: 'toggleCineDialog',
      title: '放映',
      classes: 'imageViewerCommand',
      iconClasses: 'fa fa-youtube-play',
      active: () => $('#cineDialog').is(':visible')
    });

    const buttonData = [];

    buttonData.push({
      id: 'zoom',
      title: '缩放',
      classes: 'imageViewerTool',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-zoom'
    });

    buttonData.push({
      id: 'wwwc',
      title: '调窗',
      classes: 'imageViewerTool',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-levels'
    });

    buttonData.push({
      id: 'pan',
      title: '移动',
      classes: 'imageViewerTool',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-pan'
    });

    buttonData.push({
      id: 'linkStackScroll',
      title: '链接',
      classes: 'imageViewerCommand toolbarSectionButton nonAutoDisableState',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-link',
      disableFunction: Viewerbase.viewportUtils.isStackScrollLinkingDisabled
    });

    buttonData = buttonData.concat(targetSubTools);
/*
    buttonData.push({
      id: 'toggleTarget',
      title: '标注',
      classes: 'rm-l-3',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-measure-target',
      disabled: isToolDisabled,
      subTools: targetSubTools
    });

    buttonData.push({
      id: 'nonTarget',
      title: '标签',
      classes: 'imageViewerTool',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-measure-non-target',
      disabled: isToolDisabled
    });
*/
    buttonData.push({
      id: 'toggleMore',
      title: '更多',
      classes: 'rp-x-1 rm-l-3',
      svgLink: '/packages/jf_viewerbase/assets/icons.svg#icon-tools-more',
      disabled: isToolDisabled,
      subTools: extraTools
    });

    return buttonData;
  }
});

Template.toolbarSection.events({
    'click #toggleTarget'(event, instance) {
        const $target = $(event.currentTarget);
        if (!$target.hasClass('active') && $target.hasClass('expanded')) {
            Viewerbase.toolManager.setActiveTool('bidirectional');
        }
    },

    'click #toggleHUD'(event) {
        const $this = $(event.currentTarget);

        // Stop here if the tool is disabled
        if ($this.hasClass('disabled')) {
            return;
        }

        const state = Session.get('measurementTableHudOpen');
        Session.set('measurementTableHudOpen', !state);
    },

    'click #toggleTrial'(event) {
        if (!$(event.currentTarget).hasClass('disabled')) {
            OHIF.ui.showDialog('trialOptionsModal');
        }
    }
});

Template.toolbarSection.onRendered(function() {
    // Set disabled/enabled tool buttons that are set in toolManager
    const states = Viewerbase.toolManager.getToolDefaultStates();
    const disabledToolButtons = states.disabledToolButtons;
    const allToolbarButtons = $('.toolbarSection').find('.toolbarSectionButton:not(.nonAutoDisableState)');

    // Additional toolbar buttons whose classes are not toolbarSectionButton
    allToolbarButtons.push($('#toolbarSectionEntry')[0]);
    allToolbarButtons.push($('#toggleMeasurements')[0]);

    if (disabledToolButtons && disabledToolButtons.length > 0) {
        for (let i = 0; i < allToolbarButtons.length; i++) {
            const toolbarButton = allToolbarButtons[i];
            const index = disabledToolButtons.indexOf($(toolbarButton).attr('id'));
            if (index !== -1) {
                $(toolbarButton).addClass('disabled');
                $(toolbarButton).find('*').addClass('disabled');
            } else {
                $(toolbarButton).removeClass('disabled');
                $(toolbarButton).find('*').removeClass('disabled');
            }
        }
    }
});
