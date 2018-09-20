import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';
import { cornerstone } from 'meteor/ohif:cornerstone';

Template.measurementTableTimepointCell.helpers({
    hasDataAtThisTimepoint() {
        // This simple function just checks whether or not timepoint data
        // exists for this Measurement at this Timepoint
        const instance = Template.instance();
        const { rowItem, timepointId } = instance.data;

        if (timepointId) {
            const dataAtThisTimepoint = _.where(rowItem.entries, { timepointId });
            return dataAtThisTimepoint.length > 0;
        } else {
            return rowItem.entries.length > 0;
        }
    },

    displayData() {
        const instance = Template.instance();
        const { rowItem, timepointId } = instance.data;

        let data;
        if (timepointId) {
            const dataAtThisTimepoint = _.where(rowItem.entries, { timepointId });
            if (dataAtThisTimepoint.length > 1) {
                throw 'More than one measurement was found at the same timepoint with the same measurement number?';
            }

            data = dataAtThisTimepoint[0];
        } else {
            data = rowItem.entries[0];
        }

        const config = JF.measurements.MeasurementApi.getConfiguration();
        const measurementTools = config.measurementTools;

        const toolGroup = _.findWhere(measurementTools, { id: rowItem.measurementTypeId });
        const tool = _.findWhere(toolGroup.childTools, { id: data.toolType });
        if (!tool) {
            // TODO: Figure out what is going on here?
            OHIF.log.warn('Something went wrong?');
        }

        const { detailDisplay } = toolGroup.options.measurementTable;
        return detailDisplay(data);
    },

    isLoading() {
        const instance = Template.instance();
        const { rowItem, timepointId } = instance.data;
        const { entries } = rowItem;
        const measurementData = timepointId ? _.findWhere(entries, { timepointId }) : entries[0];
        const { studyInstanceUid } = measurementData;
        return JF.studies.loadingDict.get(studyInstanceUid) === 'loading';
    }
});

Template.measurementTableTimepointCell.events({
    // 'click .measurementTableTimepointCell'(event, instance){
    //   event.stopPropagation();
    // },
    //
    'dblclick .measurementTableTimepointCell'(event, instance) {
        // const { rowItem } = instance.data;
        // const entry = rowItem.entries[0];
        //
        // // Show the measure flow for targets
        // JF.measurements.toggleLabelButton({
        //     measurement: entry,
        //     element: document.body,
        //     measurementApi: instance.data.measurementApi,
        //     position: {
        //         x: event.clientX,
        //         y: event.clientY
        //     },
        //     autoClick: true
        // });
    },

    'keydown .measurementTableTimepointCell'(event, instance) {
        // Delete a lesion if Ctrl+D or DELETE is pressed while a lesion is selected
        const keys = {
            D: 68,
            DELETE: 46
        };
        const keyCode = event.which;

        if (keyCode === keys.DELETE || keyCode === keys.BACKSPACE || (keyCode === keys.D && event.ctrlKey === true)) {
            const timepointId = instance.data.timepointId;

            const offset = $(event.currentTarget).offset();
            const dialogSettings = {
                class: 'themed',
                title: 'Delete measurements',
                message: 'Are you sure you want to delete this measurement?',
                position: {
                    x: offset.left,
                    y: offset.top
                }
            };

            OHIF.ui.showDialog('dialogConfirm', dialogSettings).then(() => {
                const measurementTypeId = instance.data.rowItem.measurementTypeId;
                const measurement = instance.data.rowItem.entries[0];
                const measurementNumber = measurement.measurementNumber;
                const { timepointApi, measurementApi } = instance.data;

                // Remove all the measurements with the given type and number
                measurementApi.deleteMeasurements(measurementTypeId, {
                    measurementNumber,
                    timepointId
                });

                // Sync the new measurement data with cornerstone tools
                const baseline = timepointApi.baseline();
                measurementApi.sortMeasurements(baseline.timepointId);

                // Repaint the images on all viewports without the removed measurements
                _.each($('.imageViewerViewport'), element => cornerstone.updateImage(element));
            });
        }
    }
});
