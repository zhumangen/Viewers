import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import { JF } from 'meteor/jf:core';

Template.seriesQuickSwitch.onCreated(() => {
    const instance = Template.instance();

    // Defines the study being shown in the current viewport
    instance.currentStudy = new ReactiveVar();

    // Gets the viewport data for the given viewport index
    instance.getViewportData = viewportIndex => {
        const layoutManager = JF.viewerbase.layoutManager;
        return layoutManager && layoutManager.viewportData && layoutManager.viewportData[viewportIndex];
    };

    // Gets the current viewport data
    const viewportIndex = instance.data.viewportIndex;

    instance.study = {};
    instance.lastStudy = {};

    instance.autorun(() => {
        JF.viewerbase.layoutManager.observer.depend();

        const viewportData = instance.getViewportData(viewportIndex);

        // @TypeSafeStudies
        if (viewportData) {
            // Finds the current study and return it
            instance.study = JF.viewer.Studies.findBy({
                studyInstanceUid: viewportData.studyInstanceUid
            });
        }

        if (!instance.study) {
            instance.study = JF.viewer.Studies.getElementByIndex(0);
        }

        if (!instance.study) {
            return;
        }

        if (instance.study.studyInstanceUid !== instance.lastStudy.studyInstanceUid) {
            // Change the current study to update the thumbnails
            instance.currentStudy.set(instance.study);

            instance.lastStudy = instance.study;
        }
    });
});

Template.seriesQuickSwitch.helpers({
    shallDisplay() {
        const instance = Template.instance();
        const { rows, columns } = instance.data;
        return JF.viewer.displaySeriesQuickSwitch && rows === 1 && columns <= 2;
    },

    side() {
        const instance = Template.instance();
        const { columns, viewportIndex } = instance.data;
        if (columns === 1) return '';
        return viewportIndex === 0 ? 'left' : 'right';
    },

    seriesItems() {
        const instance = Template.instance();

        JF.viewerbase.layoutManager.observer.depend();
        const { viewportIndex } = instance.data;
        const viewportData = JF.viewerbase.layoutManager.viewportData[viewportIndex];
        const study = instance.currentStudy.get();

        const seriesItems = [];

        let displaySets = study.displaySets;
        if (!displaySets.length) {
            displaySets = JF.viewerbase.sortingManager.getDisplaySets(study);
            study.displaySets = displaySets;
            study.setDisplaySets(displaySets);

            study.forEachDisplaySet(displaySet => {
                JF.viewerbase.stackManager.makeAndAddStack(study, displaySet);
            });
        }

        const items = displaySets.length;
        for (let i = 0; i < items; i++) {
            const displaySet = displaySets[i];
            const item = { class: '' };
            seriesItems.push(item);
            if (i === 8 && items !== 9) {
                item.class += ' count';
                item.value = items;
                break;
            }

            if (displaySet.displaySetInstanceUid === viewportData.displaySetInstanceUid) {
                item.class += ' active';
            }
        }

        return seriesItems;
    },

    studyBrowserTemplate() {
        return JF.viewer.quickSwitchStudyBrowserTemplate || 'studyBrowserQuickSwitch';
    }
});

Template.seriesQuickSwitch.events({
    'mouseenter .series-switch, rescale .series-switch'(event, instance) {
        // Control the width of the series browser
        const $switch = $(event.currentTarget);
        const $seriesBrowser = $switch.find('.series-browser');
        const $seriesQuickSwitch = $switch.closest('.series-quick-switch');

        const isRight = $seriesQuickSwitch.hasClass('right');
        const switchOffsetLeft = $switch.offset().left;
        const switchOuterWidth = $switch.outerWidth();

        let browserWidth;
        if (isRight) {
            browserWidth = $(window).width() - switchOffsetLeft;
        } else {
            browserWidth = switchOffsetLeft + switchOuterWidth;
        }

        $seriesBrowser.width(browserWidth - (browserWidth % 240));

        const $quickSwitch = instance.$('.series-quick-switch');
        if ($quickSwitch.is(':hover')) {
            $quickSwitch.addClass('series-triggered');
        }
    },

    'mouseleave .series-browser'(event, instance) {
        $(event.currentTarget).children('.scrollable').stop().animate({ scrollTop: 0 }, 300, 'swing');
    },

    'mouseleave .series-quick-switch'(event, instance) {
        $(event.currentTarget).removeClass('series-triggered');
    }
});
