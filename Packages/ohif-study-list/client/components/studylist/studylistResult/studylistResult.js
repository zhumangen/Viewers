import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { moment } from 'meteor/momentjs:moment';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';

Session.setDefault('showLoadingText', true);
Session.setDefault('serverError', false);

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

        studies = OHIF.studylist.collections.Studies.find({}, {
            sort: sortOption
        }).fetch();

        if (!studies) {
            return;
        }
        
        const TbRatings = JF.tbrating.collections.tbRatings;
        const userId = Meteor.userId();
        const statusFilter = instance.statusFilter.get();
        let filteredStudies = [];
        let index = 0;
        for (let i = 0; i < studies.length; ++i) {
            let study = studies[i];
            const qry = {
                studyUid: study.studyInstanceUid
            };
            const recs = TbRatings.find(qry).fetch();
            let length = 0;
            for (let i = 0; i < recs.length; ++i) {
                recs[i].results.forEach( res => {
                    if (res.userId === userId) {
                        length++;
                    }
                });
            }
            study.markedImages = length;
            
            let isOk = false;
            if (statusFilter > 0) {
                if (statusFilter == 1) {
                    if (length == 0) isOk = true;
                } else if (statusFilter == 2) {
                    if (length > 0 && length < study.numberOfStudyRelatedInstances)
                        isOk = true;
                } else if (statusFilter == 3) {
                    if (length == study.numberOfStudyRelatedInstances)
                        isOk = true;
                }
            } else {
                isOk = true;
            }
            
            if (isOk) {
                study.number = ++index;
                filteredStudies.push(study);
            }
        }

        // Update record count
        instance.paginationData.recordCount.set(filteredStudies.length);

        // Limit studies
        return filteredStudies.slice(offset, limit);
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

/**
 * Transforms an input string into a search filter for
 * the StudyList Search call
 *
 * @param filter The input string to be searched for
 * @returns {*}
 */
function getFilter(filter) {
    if (filter && filter.length) {
        if (filter.substr(filter.length - 1) !== '*') {
            filter += '*';
        }
        if (filter[0] !== '*') {
            filter = '*' + filter;
        }
    }

    return filter;
}

/**
 * Search for a value in a string
 */
function isIndexOf(mainVal, searchVal) {
    if (mainVal === undefined || mainVal === '' || mainVal.indexOf(searchVal) > -1){
        return true;
    }

    return false;
}

/**
 * Replace object if undefined
 */
function replaceUndefinedColumnValue(text) {
    if (text === undefined || text === 'undefined') {
        return '';
    } else {
        return text.toUpperCase();
    }
}

/**
 * Convert string to study date
 */
function convertStringToStudyDate(dateStr) {
    const y = dateStr.substring(0, 4);
    const m = dateStr.substring(4, 6);
    const d = dateStr.substring(6, 8);
    const newDateStr = m + '/' + d + '/' + y;
    return new Date(newDateStr);
}

/**
 * Runs a search for studies matching the studylist query parameters
 * Inserts the identified studies into the Studies Collection
 */
function search() {
    OHIF.log.info('search()');

    // Show loading message
    Session.set('showLoadingText', true);

    // Hiding error message
    Session.set('serverError', false);
    
    const filterOptions = JSON.parse(sessionStorage.getItem('filterOptions'));
    
    // Create the filters to be used for the StudyList Search
    let filter = {
        patientName: getFilter(filterOptions.patNameFilter),
        patientId: getFilter(filterOptions.patIdFilter),
        accessionNumber: getFilter(filterOptions.accNumFilter),
        studyDescription: getFilter(filterOptions.studyDescFilter),
        modalitiesInStudy: filterOptions.modalityFilter
    };
    if (filterOptions.studyDateFilter !== '') {
        const dates = filterOptions.studyDateFilter.replace(/ /g, '').split('-');
        filter.studyDateFrom = dates[0];
        filter.studyDateTo = dates[1];
    };

    // Make sure that modality has a reasonable value, since it is occasionally
    // returned as 'undefined'
    const modality = replaceUndefinedColumnValue($('input#modality').val());

    Meteor.call('StudyListSearch', filter, (error, studies) => {
        OHIF.log.info('StudyListSearch');
        // Hide loading text

        Session.set('showLoadingText', false);
        
        // Clear all current studies
        OHIF.studylist.collections.Studies.remove({});

        if (error) {
            Session.set('serverError', true);

            const errorType = error.error;

            if (errorType === 'server-connection-error') {
                OHIF.log.error('There was an error connecting to the DICOM server, please verify if it is up and running.');
            } else if (errorType === 'server-internal-error') {
                OHIF.log.error('There was an internal error with the DICOM server');
            } else {
                OHIF.log.error('For some reason we could not list the studies.')
            }

            OHIF.log.error(error.stack);
            return;
        }

        if (!studies) {
            OHIF.log.warn('No studies found');
            return;
        }
        
        

        // Loop through all identified studies
        studies.forEach(study => {
            // Search the rest of the parameters that aren't done via the server call
            if (isIndexOf(study.modalities, modality)/* &&
                (new Date(studyDateFrom).setHours(0, 0, 0, 0) <= convertStringToStudyDate(study.studyDate) || !studyDateFrom || studyDateFrom === '') &&
                (convertStringToStudyDate(study.studyDate) <= new Date(studyDateTo).setHours(0, 0, 0, 0) || !studyDateTo || studyDateTo === '')*/) {

                // Convert numberOfStudyRelatedInstance string into integer
                study.numberOfStudyRelatedInstances = !isNaN(study.numberOfStudyRelatedInstances) ? parseInt(study.numberOfStudyRelatedInstances) : undefined;

                // Insert any matching studies into the Studies Collection
                OHIF.studylist.collections.Studies.insert(study);
            }
        });
    });
}

const getRowsPerPage = () => sessionStorage.getItem('rowsPerPage');

// Wraps ReactiveVar equalsFunc function. Whenever ReactiveVar is
// set to a new value, it will save it in the Session Storage.
// The return is the default ReactiveVar equalsFunc if available
// or values are === compared
const setRowsPerPage = (oldValue, newValue) => {
    sessionStorage.setItem('rowsPerPage', newValue);
    return typeof ReactiveVar._isEqual === 'function' ? ReactiveVar._isEqual(oldValue, newValue) : oldValue === newValue;
};

Template.studylistResult.onCreated(() => {
    const instance = Template.instance();
    instance.sortOption = new ReactiveVar();
    instance.sortingColumns = new ReactiveDict();
    instance.statusFilter = new ReactiveVar(0);
    
    if (!sessionStorage.getItem('filterOptions')) {
        const filterOptions = {
            statusFilter: 0,
            patNameFilter: '',
            patIdFilter: '',
            accNumFilter: '',
            studyDateFilter: '',
            modalityFilter: '',
            studyDescFilter: '',
            firstInit: true
        };
        
        sessionStorage.setItem('filterOptions', JSON.stringify(filterOptions));
    }

    // Pagination parameters

    // Rows per page
    // Check session storage or set 25 as default
    const cachedRowsPerPage = getRowsPerPage();
    if (!cachedRowsPerPage) {
        setRowsPerPage(0, 25);
    }

    const rowsPerPage = getRowsPerPage();
    instance.paginationData = {
        class: 'studylist-pagination',
        currentPage: new ReactiveVar(0),
        rowsPerPage: new ReactiveVar(parseInt(rowsPerPage, 10), setRowsPerPage),
        recordCount: new ReactiveVar(0)
    };

    // Set sortOption
    const sortOptionSession = Session.get('sortOption');
    if (sortOptionSession) {
        instance.sortingColumns.set(sortOptionSession);
    } else {
        instance.sortingColumns.set({
            patientName: 1,
            studyDate: 1,
            patientId: 0,
            accessionNumber: 0,
            studyDescription: 0,
            modality: 0
        });
    }
});

Template.studylistResult.onRendered(() => {
    const instance = Template.instance();
    const filterOptions = JSON.parse(sessionStorage.getItem('filterOptions'));
    console.log('on rendered ', filterOptions);
    
    instance.statusFilter.set(filterOptions.statusFilter);
    instance.$('#status-selector').val(filterOptions.statusFilter);
    instance.$('#patientName').val(filterOptions.patNameFilter?filterOptions.patNameFilter:'');
    instance.$('#patientId').val(filterOptions.patIdFilter?filterOptions.patIdFilter:'');
    instance.$('#accessionNumber').val(filterOptions.accNumFilter?filterOptions.accNumFilter:'');
    instance.$('#studyDate').val(filterOptions.studyDateFilter?filterOptions.studyDateFilter:'');
    instance.$('#modality').val(filterOptions.modalityFilter?filterOptions.modalityFilter:'');
    instance.$('#studyDescription').val(filterOptions.studyDescFilter?filterOptions.studyDescFiter:'');

    // Initialize daterangepicker
    const today = moment();
    const lastWeek = moment().subtract(6, 'days');
    const lastMonth = moment().subtract(29, 'days');
    const $studyDate = instance.$('#studyDate');
    const dateFilterNumDays = OHIF.uiSettings.studyListDateFilterNumDays;
    let startDate, endDate;

    if (dateFilterNumDays) {
        startDate = moment().subtract(dateFilterNumDays - 1, 'days');
        endDate = today;
    }
    
    const validDate = filterOptions.studyDateFilter !== '';
    if(validDate){
        const dates = filterOptions.studyDateFilter.replace(/ /g, '').split('-');
        startDate = moment(dates[0]);
        endDate = moment(dates[1]);
    }

    const autoUpdate = validDate/* || filterOptions.firstInit */;
    instance.datePicker = $studyDate.daterangepicker({
        maxDate: today,
        autoUpdateInput: autoUpdate,
        startDate: startDate,
        endDate: endDate,
        ranges: {
            Today: [today, today],
            'Last 7 Days': [lastWeek, today],
            'Last 30 Days': [lastMonth, today]
        },
        locale: {
            applyLabel: '确定',
            cancelLabel: '清除'
        }
    }).data('daterangepicker');
    
    filterOptions.firstInit = false;
    sessionStorage.setItem('filterOptions', JSON.stringify(filterOptions));
    
    if (!autoUpdate) search();

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
    'change #status-selector'(e) {
        const val = $(e.currentTarget).val();
        Template.instance().statusFilter.set(val);
        let filterOptions = JSON.parse(sessionStorage.getItem('filterOptions'));
        filterOptions.statusFilter = val;
        sessionStorage.setItem('filterOptions', JSON.stringify(filterOptions));
    },
    
    'keydown input'(event) {
        if (event.which === 13) { //  Enter  
            const val = $(event.currentTarget).val();
            const id = $(event.currentTarget)[0].id;
            let filterOptions = JSON.parse(sessionStorage.getItem('filterOptions'));
            if (id === 'patientName') {
                filterOptions.patNameFilter = val;
            } else if (id === 'patientId') {
                filterOptions.patIdFilter = val;
            } else if (id === 'accessionNumber') {
                filterOptions.accNumFilter = val;
            } else if (id === 'modality') {
                filterOptions.modalityFilter = val;
            } else if (id === 'studyDescription') {
                filterOptions.studyDescFilter = val;
            }
            sessionStorage.setItem('filterOptions', JSON.stringify(filterOptions));
            console.log('enter ', filterOptions);
            search();
        }
    },

    'onsearch input'() {
        search();
    },

    'change #studyDate'(event) {       
        let dateRange = $(event.currentTarget).val();
        let filterOptions = JSON.parse(sessionStorage.getItem('filterOptions'));
        filterOptions.studyDateFilter = dateRange;
        sessionStorage.setItem('filterOptions', JSON.stringify(filterOptions));

        setTimeout(()=>search(), 100);
        
    },
    
    'show.daterangepicker #studyDate'(event) {
        Template.instance().datePicker.autoUpdateInput = true;
    },
    
    'cancel.daterangepicker #studyDate'(event) {
        $(event.currentTarget).val('');
        let dateRange = $(event.currentTarget).val();
        let filterOptions = JSON.parse(sessionStorage.getItem('filterOptions'));
        filterOptions.studyDateFilter = dateRange;
        sessionStorage.setItem('filterOptions', JSON.stringify(filterOptions));
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
        Session.set('sortOption', sortOption);
    }
});

