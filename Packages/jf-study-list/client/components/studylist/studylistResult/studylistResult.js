import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { moment } from 'meteor/momentjs:moment';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';

Template.studylistResult.helpers({
    /**
     * Returns a ascending sorted instance of the Studies Collection by Patient name and Study Date
     */
    studies() {
        const instance = Template.instance();
        let studies;
        let sortOption = {
            patientName: 1,
            studyDate: 1
        };

        // Update sort option if session is defined
        if (Session.get('sortOption')) {
            sortOption = Session.get('sortOption');
        }

        // Pagination parameters
        const rowsPerPage = instance.paginationData.rowsPerPage.get();
        const currentPage = instance.paginationData.currentPage.get();
        const offset = rowsPerPage * currentPage;
        const limit = offset + rowsPerPage;

        studies = JF.collections.studies.find({}, {
            sort: sortOption
        }).fetch();

        if (!studies) {
            return;
        }

        // Update record count
        instance.paginationData.recordCount.set(studies.length);

        // Limit studies
        return studies.slice(offset, limit);
    },

    numberOfStudies() {
        return Template.instance().paginationData.recordCount.get();
    },

    sortingColumnsIcons() {
        const instance = Template.instance();

        let sortingColumnsIcons = {};
        Object.keys(instance.sortingColumns.keys).forEach(key => {
            const value = instance.sortingColumns.get(key);

            if (value === 1) {
                sortingColumnsIcons[key] = 'fa fa-fw fa-sort-up';
            } else if (value === -1) {
                sortingColumnsIcons[key] = 'fa fa-fw fa-sort-down';
            } else {
                // fa-fw is blank
                sortingColumnsIcons[key] = 'fa fa-fw';
            }
        });
        return sortingColumnsIcons;
    }
});

Template.studylistResult.onCreated(() => {
    JF.studylist.clearSelections();
    const instance = Template.instance();
    instance.subscribe('studies');

    instance.sortOptions = new ReactiveVar();
    instance.sortingColumns = new ReactiveDict();
    instance.filterOptions = new ReactiveDict();

    instance.paginationData = {
        class: 'studylist-pagination',
        currentPage: new ReactiveVar(0),
        rowsPerPage: new ReactiveVar(JF.managers.settings.rowsPerPage()),
        recordCount: new ReactiveVar(0)
    };

    instance.sortingColumns.set({
        patientName: 1,
        studyDate: 1,
        patientId: 0,
        serialNumber: 0,
        studyDescription: 0,
        modality: 0
    });
});

Template.studylistResult.onRendered(() => {
    const instance = Template.instance();

    // Initialize daterangepicker
    const today = moment();
    const lastWeek = moment().subtract(1, 'week');
    const lastMonth = moment().subtract(1, 'month');
    const lastThreeMonth = moment().subtract(3, 'month');
    const $studyDate = instance.$('#studyDate');
    const config = {
      maxDate: today,
      autoUpdateInput: true,
      startDate: lastWeek,
      endDate: today,
      ranges: {
        '今天': [today, today],
        '最近一周': [lastWeek, today],
        '最近一月': [lastMonth, today],
        '最近三月': [lastThreeMonth, today]
      }
    };

    instance.datePicker = $studyDate.daterangepicker(Object.assign(config, JF.ui.datePickerConfig)).data('daterangepicker');

});

Template.studylistResult.onDestroyed(() => {
    const instance = Template.instance();

    // Destroy the daterangepicker to prevent residual elements on DOM
    instance.datePicker.remove();
});

function resetSortingColumns(instance, sortingColumn) {
    Object.keys(instance.sortingColumns.keys).forEach(key => {
        if (key !== sortingColumn) {
            instance.sortingColumns.set(key, null);
        }
    });
}

Template.studylistResult.events({
    'change #status-selector'(e, instance) {
        const val = $(e.currentTarget).val();
        instance.filterOptions.set('status', val);
    },

    'keydown input'(event, instance) {
        if (event.which === 13) { //  Enter
            const val = $(event.currentTarget).val();
            const key = $(event.currentTarget)[0].id;
            instance.filterOptions.set(key, val);
        }
    },

    'change #studyDate'(event, instance) {
        const val = $(event.currentTarget).val();
        const key = $(event.currentTarget)[0].id;
        instance.filterOptions.set(key, val);
    },

    'click div.sortingCell'(event, instance) {
        const elementId = event.currentTarget.id;

        // Remove _ from id
        const columnName = elementId.replace('_', '');

        let sortOption = {};
        resetSortingColumns(instance, columnName);

        const columnObject = instance.sortingColumns.get(columnName);
        if (columnObject) {
            instance.sortingColumns.set(columnName, columnObject * -1);
            sortOption[columnName] = columnObject * -1;
        } else {
            instance.sortingColumns.set(columnName, 1);
            sortOption[columnName] = 1;
        }

        instance.sortOption.set(sortOption);
    }
});
