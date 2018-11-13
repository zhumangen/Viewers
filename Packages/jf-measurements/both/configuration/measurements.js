import { Mongo } from 'meteor/mongo';
import { Tracker } from 'meteor/tracker';
import { _ } from 'meteor/underscore';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';
import { Session } from 'meteor/session';
import { cornerstoneTools } from 'meteor/ohif:cornerstone';

let configuration = {};

class MeasurementApi {
    static setConfiguration(config) {
        _.extend(configuration, config);
    }

    static getConfiguration() {
        return configuration;
    }

    static getToolsGroupsMap() {
        const toolsGroupsMap = {};
        configuration.measurementTools.forEach(toolGroup => {
            toolGroup.childTools.forEach(tool => (toolsGroupsMap[tool.id] = toolGroup.id));
        });
        return toolsGroupsMap;
    }

    constructor() {
        this.toolGroups = {};
        this.tools = {};
        this.toolsGroupsMap = MeasurementApi.getToolsGroupsMap();
        this.changeObserver = new Tracker.Dependency();

        configuration.measurementTools.forEach(toolGroup => {
            const groupCollection = new Mongo.Collection(null);
            groupCollection._debugName = toolGroup.name;
            // groupCollection.attachSchema(toolGroup.schema);
            this.toolGroups[toolGroup.id] = groupCollection;

            toolGroup.childTools.forEach(tool => {
                const collection = new Mongo.Collection(null);
                collection._debugName = tool.name;
                // collection.attachSchema(tool.schema);
                this.tools[tool.id] = collection;

                const addedHandler = measurement => {
                    let measurementNumber;

                    measurementNumber = groupCollection.find().count() + 1;
                    measurement.measurementNumber = measurementNumber;

                    // Get the current location/description (if already defined)
                    const updateObject = {
                        measurementNumber
                    };

                    // Set the timepoint ID, measurement number, location and description
                    collection.update(measurement._id, { $set: updateObject });

                    // Reflect the entry in the tool group collection
                    groupCollection.insert({
                        toolId: tool.id,
                        toolItemId: measurement._id,
                        createdAt: measurement.createdAt,
                        measurementNumber
                    });

                    // Enable reactivity
                    if (Session.get('MeasurementsReady'))
                      Session.set('activeMeasurement', measurement);
                    this.changeObserver.changed();
                };

                const changedHandler = measurement => {
                    this.changeObserver.changed();
                };

                const removedHandler = measurement => {
                    const measurementNumber = measurement.measurementNumber;

                    groupCollection.remove({
                        toolItemId: measurement._id
                    });

                    const filter = {
                        measurementNumber: { $gte: measurementNumber },
                    };
                    const operator = {
                        $inc: { measurementNumber: -1 }
                    };
                    const options = { multi: true };

                    const entries = groupCollection.find(filter).fetch();
                    groupCollection.update(filter, operator, options);

                    // Synchronize the updated measurements with Cornerstone Tools
                    // toolData to make sure the displayed measurements show 'Target X' correctly
                    const toolTypes = _.uniq(entries.map(entry => entry.toolId));
                    toolTypes.forEach(toolType => {
                        const collection = this.tools[toolType];
                        collection.update(filter, operator, options);
                    });

                    // Synchronize the new tool data
                    this.syncMeasurementsAndToolData();

                    // Enable reactivity
                    Session.set('activeMeasurement', undefined);
                    this.changeObserver.changed();
                };

                collection.find().observe({
                    added: addedHandler,
                    changed: changedHandler,
                    removed: removedHandler
                });
            });
        });
    }

    retrieveMeasurements(options) {
        const retrievalFn = configuration.dataExchange.retrieve;
        if (!_.isFunction(retrievalFn)) {
            return;
        }

        return new Promise((resolve, reject) => {
            retrievalFn(JF.viewer.data.order).then(measurementData => {
                OHIF.log.info('Measurement data retrieval');

                const toolsGroupsMap = MeasurementApi.getToolsGroupsMap();
                const measurementsGroups = {};

                Object.keys(measurementData).forEach(measurementTypeId => {
                    const measurements = measurementData[measurementTypeId];

                    measurements.forEach(measurement => {
                        const { toolType } = measurement;
                        if (toolType && this.tools[toolType]) {
                            delete measurement._id;
                            measurement.userId = Meteor.userId();
                            measurement.status = 0;
                            measurement.active = false;
                            const toolGroup = toolsGroupsMap[toolType];
                            if (!measurementsGroups[toolGroup]) {
                                measurementsGroups[toolGroup] = [];
                            }

                            measurementsGroups[toolGroup].push(measurement);
                        }
                    });
                });

                Object.keys(measurementsGroups).forEach(groupKey => {
                    const group = measurementsGroups[groupKey];
                    group.sort((a, b) => {
                        if (a.measurementNumber > b.measurementNumber) {
                            return 1;
                        } else if (a.measurementNumber < b.measurementNumber) {
                            return -1;
                        }

                        return 0;
                    });

                    group.forEach(m => this.tools[m.toolType].insert(m));
                });

                resolve();
            });
        });
    }

    storeMeasurements(options) {
        const storeFn = configuration.dataExchange.store;
        if (!_.isFunction(storeFn)) {
            return;
        }

        let measurementData = {};

        if (!options.abandoned) {
          configuration.measurementTools.forEach(toolGroup => {
              toolGroup.childTools.forEach(tool => {
                  if (!measurementData[toolGroup.id]) {
                      measurementData[toolGroup.id] = [];
                  }

                  measurementData[toolGroup.id] = measurementData[toolGroup.id].concat(this.tools[tool.id].find().fetch());
              });
          });
        }

        return new Promise((resolve, reject) => {
            storeFn(measurementData, JF.viewer.data.order).then(response => {
                OHIF.log.info('Measurement storage completed');
                resolve(response);
            }, error => {
              OHIF.log.error('Measurement storage error: ', error);
              reject(error);
            }).catch(error => {
              OHIF.log.error('Measurement storage error: ', error);
              reject(error);
            });
        });
    }

    submitOrder(options) {
        const changeFn = configuration.dataExchange.submitOrder;
        if (!_.isFunction(changeFn)) {
            return;
        }

        return new Promise((resolve, reject) => {
            changeFn(JF.viewer.data.order._id, options).then(result => {
                OHIF.log.info('Submit order completed');
                resolve(result);
            }).catch(error => {
                OHIF.log.error('Submit order failed: ', error);
                reject(error);
            });
        });
    }

    validateMeasurements() {
        const validateFn = configuration.dataValidation.validateMeasurements;
        if (validateFn && validateFn instanceof Function) {
            validateFn();
        }
    }

    shiftMeasurement(measurementTypeId, filter, order) {
      if ((order !== 0 && order !== 1) || !filter.measurementNumber) return;

      const groupCollection = this.toolGroups[measurementTypeId];
      // Stop here if it is a temporary toolGroups
      if (!groupCollection) return;

      // Get the entries information before removing them
      const groupItems = groupCollection.find(filter).fetch();
      const operator = {
        $inc: { measurementNumber: order===0?-1:1}
      };

      // If the filter doesn't have the measurement number, get it from the first entry
      const measurementNumber = filter.measurementNumber;
      const filterAffected = {
        measurementNumber: order===0?measurementNumber-1:measurementNumber+1
      };
      const operatorAffected = {
        $inc: { measurementNumber: order===0?1:-1 }
      };
      const affectedGroupItems = groupCollection.find(filterAffected).fetch();
      affectedGroupItems.forEach(groupItem => {
        groupCollection.update({_id: groupItem._id}, operatorAffected);
        if (!groupItem.toolId) return;
        const collection = this.tools[groupItem.toolId];
        collection.update({_id: groupItem.toolItemId}, operatorAffected);
      });

      groupItems.forEach(groupItem => {
        groupCollection.update({_id: groupItem._id}, operator);
        if (!groupItem.toolId) return;
        const collection = this.tools[groupItem.toolId];
        collection.update({_id: groupItem.toolItemId}, operator);
      });

      this.syncMeasurementsAndToolData();
    }

    syncMeasurementsAndToolData() {
        configuration.measurementTools.forEach(toolGroup => {
            toolGroup.childTools.forEach(tool => {
                const measurements = this.tools[tool.id].find().fetch();
                measurements.forEach(measurement => {
                    JF.measurements.syncMeasurementAndToolData(measurement, false);
                });
            });
        });
    }

    sortMeasurements() {
        const tools = configuration.measurementTools;

        const includedTools = tools.filter(tool => {
            return (tool.options && tool.options.caseProgress && tool.options.caseProgress.include);
        });

        // Update Measurement the displayed Measurements
        includedTools.forEach(tool => {
            const collection = this.tools[tool.id];
            const measurements = collection.find().fetch();
            measurements.forEach(measurement => {
                JF.measurements.syncMeasurementAndToolData(measurement, false);
            });
        });
    }

    updateMeasurement(measurement) {
        // const collection = this.tools[measurement.toolType];
        // collection.update({_id: measurement._id}, measurement);
        JF.measurements.syncMeasurementAndToolData(measurement);
    }

    deleteMeasurements(measurementTypeId, filter) {
        const groupCollection = this.toolGroups[measurementTypeId];

        // Stop here if it is a temporary toolGroups
        if (!groupCollection) return;

        // Get the entries information before removing them
        const groupItems = groupCollection.find(filter).fetch();
        const entries = [];
        groupItems.forEach(groupItem => {
            if (!groupItem.toolId) {
                return;
            }

            const collection = this.tools[groupItem.toolId];
            entries.push(collection.findOne(groupItem.toolItemId));
            collection.remove(groupItem.toolItemId);
        });

        // Stop here if no entries were found
        if (!entries.length) {
            return;
        }

        // If the filter doesn't have the measurement number, get it from the first entry
        const measurementNumber = filter.measurementNumber || entries[0].measurementNumber;

        // Synchronize the new data with cornerstone tools
        const toolState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();

        _.each(entries, entry => {
            const measurementsData = [];
            const { tool } = JF.measurements.getToolConfiguration(entry.toolType);
            if (Array.isArray(tool.childTools)) {
                tool.childTools.forEach(key => {
                    const childMeasurement = entry[key];
                    if (!childMeasurement) return;
                    measurementsData.push(childMeasurement);
                });
            } else {
                measurementsData.push(entry);
            }

            measurementsData.forEach(measurementData => {
                const { imagePath, toolType } = measurementData;
                const imageId = JF.viewerbase.getImageIdForImagePath(imagePath);
                if (toolState[imageId]) {
                    const toolData = toolState[imageId][toolType];
                    const measurementEntries = toolData && toolData.data;
                    const measurementEntry = _.findWhere(measurementEntries, { _id: entry._id });
                    if (measurementEntry) {
                        const index = measurementEntries.indexOf(measurementEntry);
                        measurementEntries.splice(index, 1);
                    }
                }
            });
        });

        cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(toolState);
        /*
        // Synchronize the updated measurements with Cornerstone Tools
        // toolData to make sure the displayed measurements show 'Target X' correctly
        const syncFilter = _.clone(filter);

        syncFilter.measurementNumber = {
            $gt: measurementNumber - 1
        };

        const toolTypes = _.uniq(entries.map(entry => entry.toolType));
        toolTypes.forEach(toolType => {
            const collection = this.tools[toolType];
            collection.find(syncFilter).forEach(measurement => {
                JF.measurements.syncMeasurementAndToolData(measurement);
            });
        });
        */
    }

    getMeasurementById(measurementId) {
        let foundGroup;
        _.find(this.toolGroups, toolGroup => {
            foundGroup = toolGroup.findOne({ toolItemId: measurementId });
            return !!foundGroup;
        });

        // Stop here if no group was found or if the record is a placeholder
        if (!foundGroup || !foundGroup.toolId) {
            return;
        }

        return this.tools[foundGroup.toolId].findOne(measurementId);
    }

    fetch(toolGroupId, selector, options) {
        if (!this.toolGroups[toolGroupId]) {
            throw 'MeasurementApi: No Collection with the id: ' + toolGroupId;
        }

        selector = selector || {};
        options = options || {};
        const result = [];
        const items = this.toolGroups[toolGroupId].find(selector, options).fetch();
        items.forEach(item => {
            if (item.toolId) {
                result.push(this.tools[item.toolId].findOne(item.toolItemId));
            } else {
                result.push({ measurementNumber: item.measurementNumber });
            }

        });
        return result;
    }
}

JF.measurements.MeasurementApi = MeasurementApi;
