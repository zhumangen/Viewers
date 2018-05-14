import { Mongo } from 'meteor/mongo';
import { Tracker } from 'meteor/tracker';
import { _ } from 'meteor/underscore';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';
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
        this.lesions = [];

        configuration.measurementTools.forEach(toolGroup => {
            const groupCollection = new Mongo.Collection(null);
            groupCollection._debugName = toolGroup.name;
            groupCollection.attachSchema(toolGroup.schema);
            this.toolGroups[toolGroup.id] = groupCollection;

            toolGroup.childTools.forEach(tool => {
                const collection = new Mongo.Collection(null);
                collection._debugName = tool.name;
                collection.attachSchema(tool.schema);
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
                        
                    groupCollection.update(filter, operator, options);
                    collection.update(filter, operator, options);

                    // Synchronize the new tool data
                    this.syncMeasurementsAndToolData();

                    // Enable reactivity
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
            retrievalFn(options).then(measurementData => {

                OHIF.log.info('Measurement data retrieval');

                const toolsGroupsMap = MeasurementApi.getToolsGroupsMap();
                const measurementsGroups = {};

                Object.keys(measurementData).forEach(measurementTypeId => {
                    const measurements = measurementData[measurementTypeId];

                    measurements.forEach(measurement => {
                        const { toolType } = measurement;
                        if (toolType && this.tools[toolType]) {
                            delete measurement._id;
                            measurement.userId = Session.get('userInfo').userId;
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

    storeMeasurements() {
        const storeFn = configuration.dataExchange.store;
        if (!_.isFunction(storeFn)) {
            return;
        }

        let measurementData = {};
        configuration.measurementTools.forEach(toolGroup => {
            toolGroup.childTools.forEach(tool => {
                if (!measurementData[toolGroup.id]) {
                    measurementData[toolGroup.id] = [];
                }

                measurementData[toolGroup.id] = measurementData[toolGroup.id].concat(this.tools[tool.id].find().fetch());
            });
        });

        const userId = Session.get('userInfo').userId;
        OHIF.log.info('Saving Measurements for user id: ', userId);
        
        return new Promise((resolve, reject) => {
            storeFn(measurementData, { userId }).then((measurementData) => {
                OHIF.log.info('Measurement storage completed');
                
                let measurements = [];
                configuration.measurementTools.forEach(toolGroup => {
                    measurements = measurements.concat(measurementData[toolGroup.id]);
                });
                resolve(measurements);
            }).catch(error => {
                OHIF.log.error('Measurement storage error: ', error);
                reject(error);
            });
        });
    }
    
    submitMeasurements(options, measurementData) {
        const storeFn = configuration.dataExchange.submitMeasurements;
        if (!_.isFunction(storeFn)) {
            return;
        }
        
        return new Promise((resolve, reject) => {
            storeFn(options, measurementData).then(result => {
                OHIF.log.info('Submit measurements completed');
                resolve(result);
            }).catch(error => {
                OHIF.log.error('Submit measurements failed: ', error);
                reject(error);
            });
        });
    }
    
    retrieveLesions(options) {
        const retrievalFn = configuration.dataExchange.retrieveLesions;
        if (!_.isFunction(retrievalFn)) {
            return;
        }
        
        return new Promise((resolve, reject) => {
            retrievalFn(options).then(lesions => {
                OHIF.log.info('Retrieved Lesions: ', lesions);
                this.lesions = lesions;
                configuration.schema.nonTargetLocation.allowedValues = lesions;
                resolve(lesions);
            }).catch(error => {
                OHIF.log.error('Retrieving lesions error: ', error);
                reject(error);
            });
        });
    }
    
    submitResult(options) {
        const submitFn = configuration.dataExchange.submitResult;
        if (!_.isFunction(submitFn)) {
            return;
        }
        
        return new Promise((resolve, reject) => {
            submitFn(options).then(result => {
                OHIF.log.info('Submit result: ', result.code);
                resolve(result);
            }).catch(error => {
                OHIF.log.error('Submit result error: ', error);
                reject(error);
            });
        });
    }
    
    queryUserInfo(options) {
        const queryFn = configuration.dataExchange.queryUserInfo;
        if (!_.isFunction(queryFn)) {
            return;
        }
        
        return new Promise((resolve, reject) => {
            queryFn(options).then(result => {
                OHIF.log.info('Query user info: ', result);
                resolve(result);
            }).catch(error => {
                OHIF.log.error('Query user error: ', error);
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

    syncMeasurementsAndToolData() {
        configuration.measurementTools.forEach(toolGroup => {
            toolGroup.childTools.forEach(tool => {
                const measurements = this.tools[tool.id].find().fetch();
                measurements.forEach(measurement => {
                    JF.measurements.syncMeasurementAndToolData(measurement);
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
                JF.measurements.syncMeasurementAndToolData(measurement);
            });
        });
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
                const imageId = OHIF.viewerbase.getImageIdForImagePath(imagePath);
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
