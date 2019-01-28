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
    instance.saveOnly = true;
    instance.noChanges = new ReactiveVar(true);

    instance.api = {
        save(rating) {
            // Clear signaled unsaved changes...
            const successHandler = () => {
                OHIF.ui.unsavedChanges.clear(`${instance.path}.*`);
                instance.saveObserver.changed();

                if (!instance.saveOnly) {
                    const promise = instance.data.measurementApi.submitOrder({ action: 1, rating });
                    OHIF.ui.showDialog('dialogLoading', {
                        promise,
                        text: '正在提交...'
                    });
                    promise.then(result => {
                      if (result.code !== 200) {
                        let reason = '错误的请求。';
                        if (result.code === 409) {
                          reason = '当前病例不在编辑状态。'
                        } else if (result.code === 403) {
                            reason = '未授权的操作！';
                        }
                        OHIF.ui.showDialog('dialogInfo', {
                          title: '访问受限',
                          reason,
                        });
                      } else {
                        instance.isLocked.set(true);
                      }
                    });
                }
            };

            const promise = instance.data.measurementApi.storeMeasurements({ abandoned: false });
            promise.then(successHandler).catch(instance.errorHandler);
            OHIF.ui.showDialog('dialogLoading', {
                promise,
                text: '正在保存标注数据...'
            });

            return promise;
        },
        abandon() {
            const dialogSettings = {
                class: 'themed',
                title: '放弃标注',
                message: '是否放弃标注?',
                position: {
                    x: event.clientX,
                    y: event.clientY
                },
                cancelLabel: '取消',
                confirmLabel: '确定'
            };
            OHIF.ui.showDialog('dialogConfirm', dialogSettings).then(() => {
              const promise = instance.data.measurementApi.storeMeasurements({ abandoned: true });
              promise.then(() => {
                const promise = instance.data.measurementApi.submitOrder({ action: 0 });
                promise.then(result => {
                  if (result.code === 200) {
                    instance.isLocked.set(true);
                  } else {
                    let reason = '错误的请求。';
                    if (result.code === 403) {
                      reason = '当前病例不在编辑状态。'
                    }
                    OHIF.ui.showDialog('dialogInfo', {
                      title: '访问受限',
                      reason,
                    });
                  }
                }).catch(instance.errorHandler);
                OHIF.ui.showDialog('dialogLoading', {
                    promise,
                    text: '正在放弃...'
                });
              }).catch(instance.errorHandler);
              OHIF.ui.showDialog('dialogLoading', {
                  promise,
                  text: '正在放弃更改...'
              });
            });
        }
    };

    instance.errorHandler = data => {
        OHIF.ui.showDialog('dialogInfo', Object.assign({ class: 'themed' }, data));
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

    const orderStatus = JF.viewer.data.order.status;
    instance.isLocked.set(orderStatus !== 1 && orderStatus !== 3);

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

        instance.noChanges.set(OHIF.ui.unsavedChanges.probe('viewer.*') === 0);

        return instance.isLocked.get() || instance.noChanges.get();
    }
});

Template.caseProgress.events({
    'click #save'(event, instance) {
        instance.saveOnly = true;
    },

    'click #commit'(event, instance) {
        const dialogSettings = {
            class: 'themed',
            position: {
                x: event.clientX,
                y: event.clientY
            },
            cancelLabel: '取消',
            confirmLabel: '确定'
        };
        const status = JF.viewer.data.order.status;
        if (status === 3) {
          Object.assign(dialogSettings, {
            title: '标注评价',
            message: '请给标注医生做出评价：'
          });
          OHIF.ui.showDialog('starsRatingForm', dialogSettings).then(data => {
              if (!data.rating) {
                Object.assign(dialogSettings, {
                  title: '标注评价',
                  bodyText: '您没有点亮小星星，是否按<span class="emphases">0颗星</span>处理？'
                });
                OHIF.ui.showDialog('dialogConfirm', dialogSettings).then(() => {
                    instance.saveOnly = false;
                    instance.api.save();
                });
              } else {
                instance.saveOnly = false;
                instance.api.save(data.rating);
              }
          });
        } else {
          Object.assign(dialogSettings, {
            title: '提交标注',
            message: '是否提交标注？'
          });
          OHIF.ui.showDialog('dialogConfirm', dialogSettings).then(() => {
              instance.saveOnly = false;
              instance.api.save();
          });
        }
    }
});
