import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Tracker } from 'meteor/tracker';
import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';

function search(organization, dateRange, offset, callback) {
  OHIF.log.info('dicom list search...');
  Session.set('showLoadingText', true);
  Session.set('serverError', false);

  const filter = Object.assign({}, organization.filter);
  const level = organization.qidoLevel.toUpperCase();
  const modality = filter.modality?filter.modality.toUpperCase():'';
  filter.offset = offset;

  if (dateRange) {
    const dates = dateRange.replace(/ /g, '').split('-');
    filter.studyDateFrom = dates[0];
    filter.studyDateTo = dates[1];
  }

  const callbackData = {
    nRecived: 0,
    nRemaining: 0,
    nOffset: offset,
    errorMsg: ''
  };

  JF.studies.searchDicoms(organization.serverId, level, filter).then(result => {
    OHIF.log.info('dicom list search finished')
    Session.set('showLoadingText', false);
    const dicoms = result.data;
    OHIF.log.info('Remaining results: ', result.remaining);

    if (_.isArray(dicoms)) {
      dicoms.forEach(dicom => {
        if (!modality || dicom.modality.indexOf(modality) > -1 || (dicom.modalities && dicom.modalities.indexOf(modality) > -1)) {
          dicom.numberOfStudyRelatedInstances = !isNaN(dicom.numberOfStudyRelatedInstances) ? parseInt(dicom.numberOfStudyRelatedInstances) : undefined;
          dicom.numberOfSeriesRelatedInstances = !isNaN(dicom.numberOfSSeriesRelatedInstances) ? parseInt(dicom.numberOfSSeriesRelatedInstances) : undefined;
          dicom.serverId = organization.serverId;
          dicom.qidoLevel = level;
          dicom.organizationId = organization._id;
          Tracker.nonreactive(() => {
            JF.collections.importDicoms.insert(dicom);
          });
        }
      });

      callbackData.nRecived = dicoms.length;
      callbackData.nRemaining = result.remaining;
    }

    if (_.isFunction(callback)) {
      callback(callbackData);
    }

  }).catch(error => {
    OHIF.log.info('dicom list search failed: ', error);
    Session.set('showLoadingText', false);
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

    if (_.isFunction(callback)) {
      callbackData.errorMsg = 'dicoms metadata retrieving failed: ' + errorType;
      callback(callbackData);
    }
  });
}

Template.importDicom.onCreated(() => {
  const instance = Template.instance();
  instance.subscribe('organizations');
  instance.items = new ReactiveVar([]);
  instance.dateRangeValue = new ReactiveVar('');
  instance.orgIndex = new ReactiveVar(0);
  instance.paginationData = {
    class: 'dicomlist-pagination',
    currentPage: new ReactiveVar(0),
    recordCount: new ReactiveVar(0),
    rowsPerPage: new ReactiveVar(JF.managers.settings.rowsPerPage())
  };
  instance.statusData = {
    loadAll: new ReactiveVar(false),
    loaded: new ReactiveVar(0),
    total: new ReactiveVar(0),
    errorMsg: new ReactiveVar('')
  };
  instance.searchCallback = data => {
    const loaded = data.nOffset + data.nRecived;
    const total = loaded + data.nRemaining;
    instance.statusData.loaded.set(loaded);
    instance.statusData.total.set(total);
    instance.statusData.errorMsg.set(data.errorMsg);
    instance.paginationData.recordCount.set(total);
  };
});

Template.importDicom.onRendered(() => {
  const instance = Template.instance();
  const $dicomDate = instance.$('#dicomDate');
  const today = moment();
  const lastWeek = moment().subtract(1, 'week');
  const lastMonth = moment().subtract(1, 'month');
  const lastThreeMonth = moment().subtract(3, 'month');

  const config = {
    maxDate: today,
    autoUpdateInput: true,
    startDate: today,
    endDate: today,
    ranges: {
      '今天': [today, today],
      '最近一周': [lastWeek, today],
      '最近一月': [lastMonth, today],
      '最近三月': [lastThreeMonth, today]
    }
  }

  instance.datePicker = $dicomDate.daterangepicker(Object.assign(config, JF.ui.datePickerConfig)).data('daterangepicker');

  instance.autorun(() => {
    const orgIds = JF.user.getAllGroups('js');
    const orgs = JF.organization.getLocalOrganizations(orgIds, { type: 'SCU' });

    instance.organizations = orgs;
    const items = [];
    _.each(orgs, org => items.push({value: org.name, label: org.name}));
    instance.items.set(items);
  })

  instance.autorun(() => {
    const instance = Template.instance();
    const index = instance.orgIndex.get();
    const dateRange = instance.dateRangeValue.get();
    if (index === 0) return;
    const org = instance.organizations && instance.organizations[index-1];
    if (!(org && dateRange)) return;
    JF.collections.importDicoms.remove({});
    Tracker.nonreactive(() => {
      instance.paginationData.currentPage.set(0);
      search(org, dateRange, 0, instance.searchCallback);
    });
  });

  instance.autorun(() => {
    const rowsPerPage = instance.paginationData.rowsPerPage.get();
    const currentPage = instance.paginationData.currentPage.get();
    const recordCount = instance.paginationData.recordCount.get();
    const receivedCount = JF.collections.importDicoms.find().count();
    const loadAll = instance.statusData.loadAll.get();

    if (receivedCount < recordCount &&
        ((recordCount > 0 && (currentPage+1) * rowsPerPage > receivedCount) || loadAll)) {
      Tracker.nonreactive(() => {
        const isLoading = Session.get('showLoadingText');
        if (isLoading) return;
        const index = instance.orgIndex.get();
        const dateRange = instance.dateRangeValue.get();
        if (index === 0) return;
        const org = instance.organizations && instance.organizations[index-1];
        if (!(org && dateRange)) return;
        search(org, dateRange, receivedCount, instance.searchCallback);
      });
    }
  })
});

Template.importDicom.onDestroyed(() => {
  const instance = Template.instance();
  instance.datePicker.remove();
})

Template.importDicom.helpers({

});

Template.importDicom.events({
  'change #organization'(event, instance) {
    const index = event.currentTarget.options.selectedIndex;
    instance.orgIndex.set(index);
  },

  'change #dicomDate'(event, instance) {
    const val = $(event.currentTarget).val();
    instance.dateRangeValue.set(val);
  }
});
