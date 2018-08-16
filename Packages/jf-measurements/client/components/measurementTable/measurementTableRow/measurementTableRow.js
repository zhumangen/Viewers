import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { JF } from 'meteor/jf:core';
import { cornerstone } from 'meteor/ohif:cornerstone';
import { Session } from 'meteor/session';

Template.measurementTableRow.onCreated(() => {
    const instance = Template.instance();

    instance.getWarningMessages = () => {
        const measurementTypeId = instance.data.rowItem.measurementTypeId;
        const measurementNumber = instance.data.rowItem.measurementNumber;
        const groupedNonConformities = instance.data.conformanceCriteria.groupedNonConformities.get() || {};
        const nonconformitiesByMeasurementTypeId = groupedNonConformities[measurementTypeId] || {};
        const nonconformitiesByMeasurementNumbers = nonconformitiesByMeasurementTypeId.measurementNumbers || {};
        const nonconformitiesByMeasurementNumber = nonconformitiesByMeasurementNumbers[measurementNumber] || {};

        return _.uniq(nonconformitiesByMeasurementNumber.messages || []);
    };
});

Template.measurementTableRow.onRendered(() => {
  const instance = Template.instance();
  instance.autorun(() => {
    const activeMeasurement = Session.get('activeMeasurement');
    const measurement = Template.instance().data.rowItem.entries[0];
    const $rowItem = instance.$('.measurementTableRow');
    const isActive = $rowItem.hasClass('active');
    if (!activeMeasurement || (activeMeasurement._id !== measurement._id && isActive)) {
      measurement.active = false;
      $rowItem.removeClass('active');
      if (activeMeasurement) {
        instance.data.measurementApi.updateMeasurement(measurement);
      } else {
        JF.measurements.deactivateAllToolData();
      }
      _.each($('.imageViewerViewport'), element => cornerstone.updateImage(element));
    } else if (activeMeasurement._id === measurement._id && !isActive) {
      $rowItem.addClass('active');
    }
  });
});

Template.measurementTableRow.helpers({
    isVisible() {
        return Template.instance().data.rowItem.entries[0].visible?true:false;
    },
    hasWarnings() {
        return !!Template.instance().getWarningMessages().length;
    },
    displayHeader() {
        const instance = Template.instance();
        const entry = instance.data.rowItem.entries[0];
        const config = JF.measurements.MeasurementApi.getConfiguration();
        const groupId = instance.data.measurementApi.toolsGroupsMap[entry.toolType];
        const group = _.findWhere(config.measurementTools, { id: groupId });
        const { headerDisplay } = group.options.measurementTable;
        return headerDisplay(entry);
    },
    nonTargetTool() {
        const instance = Template.instance();
        const entry = instance.data.rowItem.entries[0];
        const config = JF.measurements.MeasurementApi.getConfiguration();
        const groupId = instance.data.measurementApi.toolsGroupsMap[entry.toolType];
        const group = _.findWhere(config.measurementTools, { id: groupId });
        const tool = _.findWhere(group.childTools, { id: entry.toolType });
        return tool.options.caseProgress.nonTarget;
    }
});

Template.measurementTableRow.events({
    'click .measurementRowSidebar .warning-icon'(event, instance) {
        event.stopPropagation();
        console.log('msg', instance.getWarningMessages());
        OHIF.ui.showDialog('measurementTableWarningsDialog', {
            messages: instance.getWarningMessages(),
            position: {
                x: event.clientX,
                y: event.clientY
            }
        });
    },
    
    'click .measurementRowSidebar, click .measurementDetails'(event, instance) {
        const $row = instance.$('.measurementTableRow')
        const rowItem = instance.data.rowItem;
        const timepoints = instance.data.timepoints.get();

        $row.closest('.measurementTableView').find('.measurementTableRow').not($row).removeClass('active');
        $row.addClass('active');

        const childToolKey = $(event.target).attr('data-child');
        JF.measurements.jumpToRowItem(rowItem, timepoints, childToolKey);
    },

    'click .js-rename'(event, instance) {
        const rowItem = instance.data.rowItem;
        const entry = rowItem.entries[0];

        // Show the measure flow for targets
        JF.measurements.toggleLabelButton({
            measurement: entry,
            element: document.body,
            measurementApi: instance.data.measurementApi,
            position: {
                x: event.clientX,
                y: event.clientY
            },
            autoClick: true
        });
    },

    'click .js-delete'(event, instance) {
        const dialogSettings = {
            class: 'themed',
            title: '删除标注',
            message: '是否删除此标注?',
            position: {
                x: event.clientX,
                y: event.clientY
            },
            cancelLabel: '取消',
            confirmLabel: '确定'
        };

        OHIF.ui.showDialog('dialogConfirm', dialogSettings).then(formData => {
            const measurementTypeId = instance.data.rowItem.measurementTypeId;
            const measurement = instance.data.rowItem.entries[0];
            const measurementNumber = measurement.measurementNumber;
            const { timepointApi, measurementApi } = instance.data;

            // Remove all the measurements with the given type and number
            measurementApi.deleteMeasurements(measurementTypeId, { measurementNumber });

            // Sync the new measurement data with cornerstone tools
            measurementApi.sortMeasurements();

            // Repaint the images on all viewports without the removed measurements
            _.each($('.imageViewerViewport'), element => cornerstone.updateImage(element));

            // Notify that viewer suffered changes
            JF.measurements.triggerTimepointUnsavedChanges('deleted');
        });
    },

    'click #visible-check'(event, instance){
        event.stopPropagation()
        const measurement = instance.data.rowItem.entries[0];
        measurement.visible = $(event.currentTarget).is(':checked');
        instance.data.measurementApi.updateMeasurement(measurement);
        _.each($('.imageViewerViewport'), element => cornerstone.updateImage(element));
    }
});
