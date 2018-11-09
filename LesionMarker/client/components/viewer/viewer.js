import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { Session } from 'meteor/session';
import { ReactiveDict } from 'meteor/reactive-dict';
import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';

import 'meteor/ohif:cornerstone';
import 'meteor/jf:viewerbase';
import 'meteor/jf:metadata';

Meteor.startup(() => {
    Session.set('TimepointsReady', false);
    Session.set('MeasurementsReady', false);

    JF.viewer.displaySeriesQuickSwitch = false;
    JF.viewer.stackImagePositionOffsetSynchronizer = new JF.viewerbase.StackImagePositionOffsetSynchronizer();

    // Create the synchronizer used to update reference lines
    JF.viewer.updateImageSynchronizer = new cornerstoneTools.Synchronizer('cornerstonenewimage', cornerstoneTools.updateImageSynchronizer);

    JF.viewer.metadataProvider = new OHIF.cornerstone.MetadataProvider();

    // Metadata configuration
    const metadataProvider = JF.viewer.metadataProvider;
    cornerstone.metaData.addProvider(metadataProvider.getProvider());

    // Target tools configuration
    JF.lesiontracker.configureTargetToolsHandles();
});

Template.viewer.onCreated(() => {
    Session.set('ViewerReady', false);

    const instance = Template.instance();

    // Define the JF.viewer.data global object
    JF.viewer.data = JF.viewer.data || Session.get('ViewerData') || {};

    if (JF.viewer.data.order) {
      const order = JF.viewer.data.order;
      if (order.status > 1) {
        JF.user.getUserName(order.reporterId).then(name => {
          Session.set('reporterName', name);
        });
      }
      if (order.status > 3) {
        JF.user.getUserName(order.reviewerId).then(name => {
          Session.set('reviewerName', name);
        })
      }
    }

    const { TimepointApi, MeasurementApi, ConformanceCriteria } = JF.measurements;
    const currentTimepointId = JF.viewer.data.currentTimepointId;
    const timepointApi = new TimepointApi(currentTimepointId);
    const measurementApi = new MeasurementApi(timepointApi);
    const conformanceCriteria = new ConformanceCriteria(measurementApi, timepointApi);
    const apis = {
        timepointApi,
        measurementApi,
        conformanceCriteria
    };

    Object.assign(JF.viewer, apis);
    Object.assign(instance.data, apis);

    instance.state = new ReactiveDict();

    instance.autorun(() => {
      instance.state.set('leftSidebar', JF.managers.settings.leftSidebarOpen());
      instance.state.set('rightSidebar', JF.managers.settings.rightSidebarOpen());
    });

    instance.autorun(() => {
      const value = instance.state.get('leftSidebar');
      if (value !== JF.managers.settings.leftSidebarOpen()) {
        JF.managers.settings.setLeftSidebarOpen(value);
      }
      value = instance.state.get('rightSidebar');
      if (value !== JF.managers.settings.rightSidebarOpen()) {
        JF.managers.settings.setRightSidebarOpen(value);
      }
    });

    const viewportUtils = JF.viewerbase.viewportUtils;

    JF.viewer.functionList = $.extend(JF.viewer.functionList, {
        toggleLesionTrackerTools: JF.lesiontracker.toggleLesionTrackerTools,
        bidirectional: () => {
            // Used for hotkeys
            JF.viewerbase.toolManager.setActiveTool('bidirectional');
        },
        nonTarget: () => {
            // Used for hotkeys
            JF.viewerbase.toolManager.setActiveTool('nonTarget');
        },
        // Viewport functions
        toggleCineDialog: viewportUtils.toggleCineDialog,
        clearTools: viewportUtils.clearTools,
        resetViewport: viewportUtils.resetViewport,
        invert: viewportUtils.invert,
        flipV: viewportUtils.flipV,
        flipH: viewportUtils.flipH,
        rotateL: viewportUtils.rotateL,
        rotateR: viewportUtils.rotateR,
        linkStackScroll: viewportUtils.linkStackScroll
    });

    if (JF.viewer.data.loadedSeriesData) {
        OHIF.log.info('Reloading previous loadedSeriesData');
        JF.viewer.loadedSeriesData = JF.viewer.data.loadedSeriesData;
    } else {
        OHIF.log.info('Setting default viewer data');
        JF.viewer.loadedSeriesData = {};
        JF.viewer.data.loadedSeriesData = {};
    }

    // Store the viewer data in session for further user
    Session.setPersistent('ViewerData', JF.viewer.data);

    Session.set('activeViewport', JF.viewer.data.activeViewport || false);

    // Set lesion tool buttons as disabled if pixel spacing is not available for active element
    instance.autorun(JF.lesiontracker.pixelSpacingAutorunCheck);

    // @TypeSafeStudies
    // Clears JF.viewer.Studies collection
    JF.viewer.Studies.removeAll();

    // @TypeSafeStudies
    // Clears JF.viewer.StudyMetadataList collection
    JF.viewer.StudyMetadataList.removeAll();

    instance.data.studies.forEach(study => {
        const studyMetadata = new JF.metadata.StudyMetadata(study, study.studyInstanceUid);
        let displaySets = study.displaySets;

        if (!study.displaySets) {
            displaySets = JF.viewerbase.sortingManager.getDisplaySets(studyMetadata);
            study.displaySets = displaySets;
        }

        studyMetadata.setDisplaySets(displaySets);

        study.selected = true;
        JF.viewer.Studies.insert(study);
        JF.viewer.StudyMetadataList.insert(studyMetadata);
    });
/*
    const patientId = instance.data.studies[0].patientId;

    // LT-382: Preventing HP to keep identifying studies in timepoints that might be removed
    instance.data.studies.forEach(study => (delete study.timepointType));

    // TODO: Consider combining the retrieval calls into one?
    const timepointsPromise = timepointApi.retrieveTimepoints({ patientId });
    timepointsPromise.then(() => {
        const timepoints = timepointApi.all();

        //  Set timepointType in studies to be used in hanging protocol engine
        timepoints.forEach(timepoint => {
            timepoint.studyInstanceUids.forEach(studyInstanceUid => {
                const study = _.find(instance.data.studies, element => {
                    return element.studyInstanceUid === studyInstanceUid;
                });
                if (!study) {
                    return;
                }

                // @TODO: Maybe this should be a setCustomAttribute?
                study.timepointType = timepoint.timepointType;
            });
        });

        Session.set('TimepointsReady', true);

        const timepointIds = timepoints.map(t => t.timepointId);

        const measurementsPromise = measurementApi.retrieveMeasurements(patientId, timepointIds);
        measurementsPromise.then(() => {
            Session.set('MeasurementsReady', true);

            measurementApi.syncMeasurementsAndToolData();
        });
    });
*/
    // Provide the necessary data to the Measurement API and Timepoint API
    /* const prior = timepointApi.prior();
    if (prior) {
        measurementApi.priorTimepointId = prior.timepointId;
    } */

    //  Enable/Disable Lesion Tracker Tools if the opened study is associated or not
    // JF.lesiontracker.toggleLesionTrackerToolsButtons(!!currentTimepointId);

    const measurementsPromise = measurementApi.retrieveMeasurements();
    measurementsPromise.then(() => {
        Session.set('MeasurementsReady', true);
        measurementApi.syncMeasurementsAndToolData();
    });

    let firstMeasurementActivated = false;
    instance.autorun(() => {
        if (// !Session.get('TimepointsReady') ||
            !Session.get('MeasurementsReady') ||
            !Session.get('ViewerReady') ||
            firstMeasurementActivated) {
            return;
        }

        // Find and activate the first measurement by Lesion Number
        // NOTE: This is inefficient, we should be using a hanging protocol
        // to hang the first measurement's imageId immediately, rather
        // than changing images after initial loading...
        const config = JF.measurements.MeasurementApi.getConfiguration();
        const tools = config.measurementTools[0].childTools;
        const firstTool = tools[Object.keys(tools)[0]];
        const measurementTypeId = firstTool.id;

        const collection = measurementApi.tools[measurementTypeId];
        const sorting = {
            sort: {
                measurementNumber: -1
            }
        };

        const data = collection.find({}, sorting).fetch();

        const current = timepointApi.current();
        if (!current) {
            return;
        }

        let timepoints = [current];
        const prior = timepointApi.prior();
        if (prior) {
            timepoints.push(prior);
        }

        // TODO: Clean this up, it's probably an inefficient way to get what we need
        const groupObject = _.groupBy(data, m => m.measurementNumber);

        // Reformat the data
        const rows = Object.keys(groupObject).map(key => ({
            measurementTypeId: measurementTypeId,
            measurementNumber: key,
            entries: groupObject[key]
        }));

        const rowItem = rows[0];

        // Activate the first lesion
        if (rowItem) {
            JF.measurements.jumpToRowItem(rowItem, timepoints);
        }

        firstMeasurementActivated = true;
    });

    instance.measurementModifiedHandler = _.throttle((event, instance) => {
        JF.measurements.MeasurementHandlers.onModified(event, instance);
    }, 300);
});

/**
 * Sets sidebar configuration and active tool based on viewer template instance
 * @param  {Object} instance Template instance for viewer template
 */
const setActiveToolAndSidebar = () => {
    const instance = Template.instance();
    const { studies, currentTimepointId, measurementApi, timepointIds } = instance.data;

    // Default actions for Associated Studies
    if (currentTimepointId) {
        // Follow-up studies: same as the first measurement in the table
        // Baseline studies: target-tool
        if (studies[0]) {
            let activeTool;
            // In follow-ups, get the baseline timepointId
            const timepointId = timepointIds.find(id => id !== currentTimepointId);

            // Follow-up studies
            if (studies[0].timepointType === 'followup' && timepointId) {
                const measurementTools = JF.measurements.MeasurementApi.getConfiguration().measurementTools;

                // Create list of measurement tools
                const measurementTypes = measurementTools.map(
                    tool => {
                        const { id, cornerstoneToolType } = tool;
                        return {
                            id,
                            cornerstoneToolType
                        };
                    }
                );

                // Iterate over each measurement tool to find the first baseline
                // measurement. If so, stops the loop and prevent fetching from all
                // collections
                measurementTypes.every(({ id, cornerstoneToolType }) => {
                    // Get measurement
                    if (measurementApi[id]) {
                        const measurement = measurementApi[id].findOne({ timepointId });

                        // Found a measurement, save tool and stop loop
                        if (measurement) {
                            const isArray = Array.isArray(cornerstoneToolType);
                            activeTool = isArray ? cornerstoneToolType[0] : cornerstoneToolType;

                            return false;
                        }
                    }

                    return true;
                });
            }

            // If not set, for associated studies default is target-tool
            JF.viewerbase.toolManager.setActiveTool(activeTool || 'targetEllipse');
        }
    }
};

/**
 * Inits OHIF Hanging Protocol's onReady.
 * It waits for OHIF Hanging Protocol to be ready to instantiate the ProtocolEngine
 * Hanging Protocol will use OHIF LayoutManager to render viewports properly
 */

const initHangingProtocol = () => {
    // When Hanging Protocol is ready
    HP.ProtocolStore.onReady(() => {

        setActiveToolAndSidebar();

        // Gets all StudyMetadata objects: necessary for Hanging Protocol to access study metadata
        const studyMetadataList = JF.viewer.StudyMetadataList.all();

        // Caches Layout Manager: Hanging Protocol uses it for layout management according to current protocol
        const layoutManager = JF.viewerbase.layoutManager;

        // Instantiate StudyMetadataSource: necessary for Hanging Protocol to get study metadata
        const studyMetadataSource = new JF.studies.classes.OHIFStudyMetadataSource();

        // Creates Protocol Engine object with required arguments
        const ProtocolEngine = new HP.ProtocolEngine(layoutManager, studyMetadataList, [], studyMetadataSource);

        // Sets up Hanging Protocol engine
        HP.setEngine(ProtocolEngine);

        Session.set('ViewerReady', true);

        Session.set('activeViewport', 0);
    });
};

Template.viewer.onRendered(function() {
    this.autorun(() => {
        // To make sure ohif viewerMain is rendered before initializing Hanging Protocols
        const isOHIFViewerMainRendered = Session.get('OHIFViewerMainRendered');

        // To avoid first run
        if (isOHIFViewerMainRendered) {
            // To run only when ViewerMainRendered dependency has changed.
            // because initHangingProtocol can have other reactive components
            Tracker.nonreactive(initHangingProtocol);
        }
    });
});

Template.viewer.helpers({
    dataSourcesReady() {
        // TODO: Find a better way to do this
        const ready = Session.get('MeasurementsReady');
        OHIF.log.info('dataSourcesReady? : ' + ready);
        return ready;
    },

    state() {
        return Template.instance().state;
    }
});

Template.viewer.events({
    'cornerstonetoolsmeasurementadded .imageViewerViewport'(event, instance) {
        const originalEvent = event.originalEvent;
        JF.measurements.MeasurementHandlers.onAdded(originalEvent, instance);
    },

    'cornerstonetoolsmeasurementmodified .imageViewerViewport'(event, instance) {
        const originalEvent = event.originalEvent;
        instance.measurementModifiedHandler(originalEvent, instance);
    },

    'cornerstonemeasurementremoved .imageViewerViewport'(event, instance) {
        const originalEvent = event.originalEvent;
        JF.measurements.MeasurementHandlers.onRemoved(originalEvent, instance);
    }
});

Template.viewer.onDestroyed(() => {
    Session.set('ViewerMainReady', false);
    Session.set('TimepointsReady', false);
    Session.set('MeasurementsReady', false);

    JF.viewer.stackImagePositionOffsetSynchronizer.deactivate();
});
