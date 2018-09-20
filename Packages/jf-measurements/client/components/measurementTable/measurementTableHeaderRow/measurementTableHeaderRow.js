import { Template } from 'meteor/templating';
import { JF } from 'meteor/jf:core';
import { cornerstoneTools } from 'meteor/ohif:cornerstone';
import { Viewerbase } from 'meteor/jf:viewerbase';

Template.measurementTableHeaderRow.helpers({
    numberOfMeasurements(toolGroupId) {
        const { toolGroup, measurementRows } = Template.instance().data;
        if (toolGroup.id === 'newTargets') {
            let result = 0;

            measurementRows.forEach(measurementRow => {
                const measurementData = measurementRow.entries[0];
                if (measurementData.isSplitLesion) return;
                result++;
            });

            return result;
        }

        return measurementRows.length ? measurementRows.length : null;
    },

    getMax(toolGroupId) {
        const { conformanceCriteria } = Template.instance().data;
        if (!conformanceCriteria) return;

        if (toolGroupId === 'targets') {
            return conformanceCriteria.maxTargets.get();
        } else if (toolGroupId === 'newTargets') {
            return conformanceCriteria.maxNewTargets.get();
        }
    },

    anyUnmarkedLesionsLeft() {
        // Skip New Lesions section
        const instance = Template.instance();
        const { toolGroup, measurementRows, timepointApi, measurementApi } = instance.data;
        if (!measurementRows) return;

        const config = JF.measurements.MeasurementApi.getConfiguration();
        if (config.newLesions && config.newLesions.find(o => o.id === toolGroup.id)) return;

        const current = timepointApi.current();
        const prior = timepointApi.prior();
        if (!prior) return true;

        const currentFilter = { timepointId: current.timepointId };
        const priorFilter = { timepointId: prior.timepointId };
        const toolGroupId = toolGroup.id;

        const numCurrent = measurementApi.fetch(toolGroupId, currentFilter).length;
        const numPrior = measurementApi.fetch(toolGroupId, priorFilter).length;
        const remaining = Math.max(numPrior - numCurrent, 0);
        return remaining > 0;
    }
});

Template.measurementTableHeaderRow.events({
    'click .js-setTool'(event, instance) {
        const { toolGroup } = instance.data;
        const tool = toolGroup.childTools[0];
        const toolType = tool.cornerstoneToolType;
        const setTool = instance.$('.js-setTool');
        if (tool.options.caseProgress.nonTarget) {
            const measurement = cornerstoneTools[toolType].createNewMeasurement();
            Session.set('measurementData', measurement);
        } else {
            const activeToolId = Array.isArray(toolType) ? toolType[0] : toolType;
            Viewerbase.toolManager.setActiveTool(activeToolId);
            setTool.popover({
                trigger: 'click',
                placement: 'top',
                html: true,
                content: '请开始标注',
                container: 'body',
                animation: false
            });
            setTool.popover('show');
            clearTimeout(instance.timeout);
            instance.timeout = setTimeout(function(){
                setTool.popover('hide');
            },1000)
        }
    }
});
