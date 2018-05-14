import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';

Template.caseProgress.onCreated(() => {
    const instance = Template.instance();

    instance.progressPercent = new ReactiveVar();
    instance.progressText = new ReactiveVar();
    instance.isLocked = new ReactiveVar(false);
    instance.isFollowUp = new ReactiveVar(false);
    instance.path = 'viewer.studyViewer.measurements';
    instance.saveObserver = new Tracker.Dependency();
    instance.isCompleted = new ReactiveVar(false);
    instance.saveOnly = true;

    instance.api = {
        save() {
            // Display the error messages
            const errorHandler = data => {
                OHIF.ui.showDialog('dialogInfo', Object.assign({ class: 'themed' }, data));
            };
            
            // Clear signaled unsaved changes...
            const successHandler = (measurementData) => {
                OHIF.ui.unsavedChanges.clear(`${instance.path}.*`);
                instance.saveObserver.changed();
                
                if (!instance.saveOnly) {
                    // save measurements to main server.
                    let options = Session.get('queryParams');
                    Object.assign(options, Session.get('userInfo'));
                    const promise = instance.data.measurementApi.submitMeasurements(options, measurementData);
                    promise.then(() => {
                        Object.assign(options, { actionCode: '0' });
                        const promise = instance.data.measurementApi.submitResult(options);
                        promise.then(() => {
                            instance.isCompleted.set(true);
                        }).catch(errorHandler);
                        OHIF.ui.showDialog('dialogLoading', {
                            promise,
                            text: 'Committing data to main server.'
                        });
                    }).catch(errorHandler);
                    OHIF.ui.showDialog('dialogLoading', {
                        promise,
                        text: 'Saving measurement data to main server.'
                    });
                }
            };

            const promise = instance.data.measurementApi.storeMeasurements();
            promise.then(successHandler).catch(errorHandler);
            OHIF.ui.showDialog('dialogLoading', {
                promise,
                text: 'Saving measurement data'
            });

            return promise;
        }
    };

    instance.unsavedChangesHandler = () => {
        const isNotDisabled = !instance.$('.js-finish-case').hasClass('disabled');
        if (isNotDisabled && instance.progressPercent.get() === 100) {
            instance.api.save();
        }
    };

    // Attach handler for unsaved changes dialog...
    OHIF.ui.unsavedChanges.attachHandler(instance.path, 'save', instance.unsavedChangesHandler);
});

Template.caseProgress.onDestroyed(() => {
    const instance = Template.instance();
    // Remove unsaved changes handler after this view has been destroyed...
    OHIF.ui.unsavedChanges.removeHandler(instance.path, 'save', instance.unsavedChangesHandler);
});

Template.caseProgress.onRendered(() => {
    const instance = Template.instance();
    const { timepointApi, measurementApi } = instance.data;

    // Stop here if we have no current timepoint ID (and therefore no defined timepointAPI)
    if (!timepointApi) {
        instance.progressPercent.set(100);
        return;
    }

    // Get the current and prior timepoints
    const current = timepointApi.current();
    const prior = timepointApi.prior();

    // Stop here if timepoint is locked
    if (current && current.isLocked) {
        return instance.isLocked.set(true);
    } else {
        instance.isLocked.set(false);
    }

    // Stop here if no current or prior timepoint was found
    if (!current || !prior || !current.timepointId) {
        return instance.progressPercent.set(100);
    }

    // Retrieve the initial number of targets left to measure at this
    // follow-up. Note that this is done outside of the reactive function
    // below so that new lesions don't change the initial target count.

    const config = JF.measurements.MeasurementApi.getConfiguration();
    const toolGroups = config.measurementTools;

    const toolIds = [];
    toolGroups.forEach(toolGroup => toolGroup.childTools.forEach(tool => {
        const option = 'options.caseProgress.include';
        if (OHIF.utils.ObjectPath.get(tool, option)) {
            toolIds.push(tool.id);
        }
    }));

    const getTimepointFilter = timepointId => ({
        timepointId,
        toolId: { $in: toolIds }
    });

    const getNumMeasurementsAtTimepoint = timepointId => {
        OHIF.log.info('getNumMeasurementsAtTimepoint');
        const filter = getTimepointFilter(timepointId);

        let count = 0;
        toolGroups.forEach(toolGroup => {
            count += measurementApi.fetch(toolGroup.id, filter).length;
        });

        return count;
    };

    const getNumRemainingBetweenTimepoints = (currentTimepointId, priorTimepointId) => {
        const currentFilter = getTimepointFilter(currentTimepointId);
        const priorFilter = getTimepointFilter(priorTimepointId);

        let totalRemaining = 0;
        toolGroups.forEach(toolGroup => {
            const toolGroupId = toolGroup.id;
            const numCurrent = measurementApi.fetch(toolGroupId, currentFilter).length;
            const numPrior = measurementApi.fetch(toolGroupId, priorFilter).length;
            const remaining = Math.max(numPrior - numCurrent, 0);
            totalRemaining += remaining;
        });

        return totalRemaining;
    };

    // If we're currently reviewing a Baseline timepoint, don't do any
    // progress measurement.
    if (current.timepointType === 'baseline') {
        instance.progressPercent.set(100);
        instance.isFollowUp.set(false);
    } else {
        instance.isFollowUp.set(true);
        // Setup a reactive function to update the progress whenever
        // a measurement is made
        instance.autorun(() => {
            measurementApi.changeObserver.depend();
            // Obtain the number of Measurements for which the current Timepoint has
            // no Measurement data
            const totalMeasurements = getNumMeasurementsAtTimepoint(prior.timepointId);
            const numRemainingMeasurements = getNumRemainingBetweenTimepoints(current.timepointId, prior.timepointId);
            const numMeasurementsMade = totalMeasurements - numRemainingMeasurements;

            // Update the Case Progress text with the remaining measurement count
            instance.progressText.set(numRemainingMeasurements);

            // Calculate the Case Progress as a percentage in order to update the
            // radial progress bar
            const progressPercent = Math.min(100, Math.round(100 * numMeasurementsMade / totalMeasurements));
            instance.progressPercent.set(progressPercent);
        });
    }
});

Template.caseProgress.helpers({
    progressPercent() {
        return Template.instance().progressPercent.get();
    },

    progressText() {
        return Template.instance().progressText.get();
    },

    isLocked() {
        return Template.instance().isLocked.get();
    },

    progressComplete() {
        const instance = Template.instance();
        if (!instance.data.timepointApi) {
            return true;
        }

        const progressPercent = instance.progressPercent.get();
        return progressPercent === 100;
    },

    isFinishDisabled() {
        const instance = Template.instance();

        // Run this computation on save or every time any measurement / timepoint suffer changes
        OHIF.ui.unsavedChanges.depend();
        instance.saveObserver.depend();
        Session.get('LayoutManagerUpdated');
        if(instance.isCompleted.get()) {
            return true;
        }       
        return OHIF.ui.unsavedChanges.probe('viewer.*') === 0;        
    }
});

Template.caseProgress.events({
    'click #save'(event, instance) {
        instance.saveOnly = true;
    },
    
    'click #commit'(event, instance){
        instance.saveOnly = false;
        instance.api.save();
    },

    'click #abandon'(event, instance){
        const params = Session.get('queryParams');
        const options = Object.assign({}, params, { actionCode: '1' });
        instance.data.measurementApi.submitResult(options).then(() => {
            instance.isCompleted.set(true);
        });
    }
});
