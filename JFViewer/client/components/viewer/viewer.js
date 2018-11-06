import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Tracker } from 'meteor/tracker';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';

import 'meteor/ohif:cornerstone';
import 'meteor/jf:viewerbase';
import 'meteor/jf:metadata';

/**
 * Inits OHIF Hanging Protocol's onReady.
 * It waits for OHIF Hanging Protocol to be ready to instantiate the ProtocolEngine
 * Hanging Protocol will use OHIF LayoutManager to render viewports properly
 */
const initHangingProtocol = () => {
    // When Hanging Protocol is ready
    HP.ProtocolStore.onReady(() => {

        // Gets all StudyMetadata objects: necessary for Hanging Protocol to access study metadata
        const studyMetadataList = JF.viewer.StudyMetadataList.all();

        // Caches Layout Manager: Hanging Protocol uses it for layout management according to current protocol
        const layoutManager = JF.viewerbase.layoutManager;

        // Instantiate StudyMetadataSource: necessary for Hanging Protocol to get study metadata
        const studyMetadataSource = new JF.studies.classes.OHIFStudyMetadataSource();

        // Creates Protocol Engine object with required arguments
        const ProtocolEngine = new HP.ProtocolEngine(layoutManager, studyMetadataList, undefined, studyMetadataSource);

        // Sets up Hanging Protocol engine
        HP.setEngine(ProtocolEngine);

        Session.set('ViewerReady', true);

        Session.set('activeViewport', 0);
    });
};

Meteor.startup(() => {
    Session.setDefault('activeViewport', false);
    Session.setDefault('leftSidebar', false);
    Session.setDefault('rightSidebar', false);

    JF.viewer.defaultTool = 'wwwc';
    JF.viewer.refLinesEnabled = true;
    JF.viewer.cine = {
        framesPerSecond: 24,
        loop: true
    };

    const viewportUtils = JF.viewerbase.viewportUtils;

    JF.viewer.functionList = {
        toggleCineDialog: viewportUtils.toggleCineDialog,
        toggleCinePlay: viewportUtils.toggleCinePlay,
        clearTools: viewportUtils.clearTools,
        resetViewport: viewportUtils.resetViewport,
        invert: viewportUtils.invert
    };

    JF.viewer.stackImagePositionOffsetSynchronizer = new JF.viewerbase.StackImagePositionOffsetSynchronizer();

    // Create the synchronizer used to update reference lines
    JF.viewer.updateImageSynchronizer = new cornerstoneTools.Synchronizer('cornerstonenewimage', cornerstoneTools.updateImageSynchronizer);

    JF.viewer.metadataProvider = new OHIF.cornerstone.MetadataProvider();

    // Metadata configuration
    const metadataProvider = JF.viewer.metadataProvider;
    cornerstone.metaData.addProvider(metadataProvider.provider.bind(metadataProvider));
});

Template.viewer.onCreated(() => {
    Session.set('ViewerReady', false);

    const instance = Template.instance();

    // Define the JF.viewer.data global object
    JF.viewer.data = JF.viewer.data || Session.get('ViewerData') || {};

    instance.state = new ReactiveDict();
    instance.state.set('leftSidebar', Session.get('leftSidebar'));
    instance.state.set('rightSidebar', Session.get('rightSidebar'));

    if (JF.viewer.data && JF.viewer.data.loadedSeriesData) {
        OHIF.log.info('Reloading previous loadedSeriesData');
        JF.viewer.loadedSeriesData = JF.viewer.data.loadedSeriesData;
    } else {
        OHIF.log.info('Setting default viewer data');
        JF.viewer.loadedSeriesData = {};
        JF.viewer.data.loadedSeriesData = JF.viewer.loadedSeriesData;

        // Update the viewer data object
        JF.viewer.data.viewportColumns = 1;
        JF.viewer.data.viewportRows = 1;
        JF.viewer.data.activeViewport = 0;
    }

    // Store the viewer data in session for further user
    Session.setPersistent('ViewerData', JF.viewer.data);

    Session.set('activeViewport', JF.viewer.data.activeViewport || 0);

    // @TypeSafeStudies
    // Clears JF.viewer.Studies collection
    JF.viewer.Studies.removeAll();

    // @TypeSafeStudies
    // Clears JF.viewer.StudyMetadataList collection
    JF.viewer.StudyMetadataList.removeAll();

    JF.viewer.data.studyInstanceUids = [];
    instance.data.studies.forEach(study => {
        const studyMetadata = new JF.metadata.StudyMetadata(study, study.studyInstanceUid);
        let displaySets = study.displaySets;

        if(!study.displaySets) {
            displaySets = JF.viewerbase.sortingManager.getDisplaySets(studyMetadata);
            study.displaySets = displaySets;
        }

        studyMetadata.setDisplaySets(displaySets);

        study.selected = true;
        JF.viewer.Studies.insert(study);
        JF.viewer.StudyMetadataList.insert(studyMetadata);
        JF.viewer.data.studyInstanceUids.push(study.studyInstanceUid);
    });
});

Template.viewer.onRendered(function() {

    this.autorun(function() {
        // To make sure ohif viewerMain is rendered before initializing Hanging Protocols
        const isOHIFViewerMainRendered = Session.get('OHIFViewerMainRendered');

        // To avoid first run
        if (isOHIFViewerMainRendered) {
            // To run only when OHIFViewerMainRendered dependency has changed.
            // because initHangingProtocol can have other reactive components
            Tracker.nonreactive(initHangingProtocol);
        }
    });

});

Template.viewer.events({
    'click .js-toggle-studies'() {
        const instance = Template.instance();
        const current = instance.state.get('leftSidebar');
        instance.state.set('leftSidebar', !current);
    },

    'click .js-toggle-protocol-editor'() {
        const instance = Template.instance();
        const current = instance.state.get('rightSidebar');
        instance.data.state.set('rightSidebar', !current);
    },
});

Template.viewer.helpers({
    state() {
        return Template.instance().state;
    }
});
