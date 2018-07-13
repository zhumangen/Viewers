import { JF } from 'meteor/jf:core';
import handleSingleMeasurementAdded from './handleSingleMeasurementAdded';
import handleChildMeasurementAdded from './handleChildMeasurementAdded';
import handleSingleMeasurementModified from './handleSingleMeasurementModified';
import handleChildMeasurementModified from './handleChildMeasurementModified';
import handleSingleMeasurementRemoved from './handleSingleMeasurementRemoved';
import handleChildMeasurementRemoved from './handleChildMeasurementRemoved';
import getImageAttributes from './getImageAttributes';

const MeasurementHandlers = {
    handleSingleMeasurementAdded,
    handleChildMeasurementAdded,
    handleSingleMeasurementModified,
    handleChildMeasurementModified,
    handleSingleMeasurementRemoved,
    handleChildMeasurementRemoved,
    getImageAttributes,

    onAdded(event, instance) {
        const eventData = event.detail;
        const { toolType } = eventData;
        const { toolGroupId, toolGroup, tool } = JF.measurements.getToolConfiguration(toolType);
        const params = {
            instance,
            eventData,
            tool,
            toolGroupId,
            toolGroup
        };

        if (!tool) return;

        if (tool.parentTool) {
            this.handleChildMeasurementAdded(params);
        } else {
            this.handleSingleMeasurementAdded(params);
        }
    },

    onModified(event, instance) {
        const eventData = event.detail;
        const { toolType } = eventData;
        const { toolGroupId, toolGroup, tool } = JF.measurements.getToolConfiguration(toolType);
        const params = {
            instance,
            eventData,
            tool,
            toolGroupId,
            toolGroup
        };

        if (!tool) return;

        if (tool.parentTool) {
            this.handleChildMeasurementModified(params);
        } else {
            this.handleSingleMeasurementModified(params);
        }
    },

    onRemoved(e, instance) {
        const eventData = event.detail;
        const { toolType } = eventData;
        const { toolGroupId, toolGroup, tool } = JF.measurements.getToolConfiguration(toolType);
        const params = {
            instance,
            eventData,
            tool,
            toolGroupId,
            toolGroup
        };

        if (!tool) return;

        if (tool.parentTool) {
            MeasurementHandlers.handleChildMeasurementRemoved(params);
        } else {
            MeasurementHandlers.handleSingleMeasurementRemoved(params);
        }
    }
};

JF.measurements.MeasurementHandlers = MeasurementHandlers;
