import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Tracker } from 'meteor/tracker';
import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

function search(organization, dateRange, offset, callback) {
  OHIF.log.info('dicom list search...');
  Session.set('showLoadingText', true);
  Session.set('serverError', false);

  const filters = Object.assign({}, organization.filters);
  const level = organization.qidoLevel.toUpperCase();
  const modalities = [];
  if (filters.modalities) {
    Object.keys(filters.modalities).forEach(k => {
      if (filters.modalities[k]) {
        modalities.push(k.toUpperCase());
      }
    });
  }
  filters.offset = offset;

  if (dateRange) {
    const dates = dateRange.replace(/ /g, '').split('-');
    filters.studyDateFrom = dates[0];
    filters.studyDateTo = dates[1];
  }

  const callbackData = {
    nRecived: 0,
    nRemaining: 0,
    nOffset: offset,
    errorMsg: ''
  };

  JF.studies.searchDicoms(organization.serverId, level, filters).then(result => {
    OHIF.log.info('dicom list search finished')
    Session.set('showLoadingText', false);
    const dicoms = result.data;
    OHIF.log.info('Remaining results: ', result.remaining);

    if (_.isArray(dicoms)) {
      dicoms.forEach(dicom => {
        let ok = true;
        if (!modalities) {
          ok = false;
          modalities.forEach(m => {
            if (dicom.modalities && dicom.modalities.indexOf(m) >= 0) {
              ok = true;
            }
          });
        }
        if (ok) {
          if (_.isString(dicom.patientSex)) dicom.patientSex = dicom.patientSex.toUpperCase();
          dicom.patientAge = JF.dicomlist.getPatientAge(dicom.patientAge, dicom.patientBirthdate, dicom.seriesDate||dicom.studyDate);
          delete dicom.patientBirthdate;
          dicom.dicomTime = moment(dicom.studyDate+dicom.studyTime, 'YYYYMMDDHHmmss.SSS').toDate();
          delete dicom.studyDate;
          delete dicom.studyTime;
          if (level === 'SERIES' && dicom.seriesDate && dicom.seriesTime) {
            dicom.dicomTime = moment(dicom.seriesDate+dicom.seriesTime, 'YYYYMMDDHHmmss.SSS').toDate();
            delete dicom.seriesDate;
            delete dicom.seriesTime;
          }
          if (isNaN(dicom.dicomTime.valueOf())) {
            delete dicom.dicomTime;
          }
          dicom.numberOfStudyRelatedInstances = !isNaN(dicom.numberOfStudyRelatedInstances) ? parseInt(dicom.numberOfStudyRelatedInstances) : undefined;
          dicom.numberOfSeriesRelatedInstances = !isNaN(dicom.numberOfSSeriesRelatedInstances) ? parseInt(dicom.numberOfSSeriesRelatedInstances) : undefined;
          dicom.serverId = organization.serverId;
          dicom.qidoLevel = level;
          dicom.organizationId = organization._id;
          dicom.status = 0;
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

Template.dicomListToolbar.onCreated(() => {
  const instance = Template.instance();
  instance.dateRangeValue = new ReactiveVar('');
  instance.orgIndex = new ReactiveVar(0);

  instance.searchCallback = data => {
    const loaded = data.nOffset + data.nRecived;
    const total = loaded + data.nRemaining;
    instance.data.statusData.loaded.set(loaded);
    instance.data.statusData.total.set(total);
    instance.data.statusData.errorMsg.set(data.errorMsg);
    instance.data.paginationData.currentPage.set(0);
    instance.data.paginationData.recordCount.set(total);
  };

  instance.getCurrentOrg = () => {
    let org;
    const orgIdx = instance.orgIndex.get();
    if (orgIdx > 0) {
      org = instance.organizations && instance.organizations[orgIdx-1];
    }
    return org;
  }
});

Template.dicomListToolbar.onRendered(() => {
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
    const orgs = JF.organization.getLocalOrganizations.call(JF.organization.organizations, orgIds, { type: 'SCU' });

    instance.organizations = orgs;
    const items = [];
    _.each(orgs, org => items.push({value: org._id, label: org.name}));
    instance.data.orgItems.set(items);
  });

  instance.autorun(() => {
    const instance = Template.instance();
    const dateRange = instance.dateRangeValue.get();
    const org = instance.getCurrentOrg();
    if (!(org && dateRange)) return;
    JF.collections.importDicoms.remove({});
    Tracker.nonreactive(() => {
      instance.data.paginationData.currentPage.set(0);
      search(org, dateRange, 0, instance.searchCallback);
    });
  });

  instance.autorun(() => {
    const rowsPerPage = instance.data.paginationData.rowsPerPage.get();
    const currentPage = instance.data.paginationData.currentPage.get();
    const recordCount = instance.data.paginationData.recordCount.get();
    const receivedCount = JF.collections.importDicoms.find().count();
    const loadAll = instance.data.statusData.loadAll.get();

    if (receivedCount < recordCount &&
        ((recordCount > 0 && (currentPage+1) * rowsPerPage > receivedCount) || loadAll)) {
      Tracker.nonreactive(() => {
        const isLoading = Session.get('showLoadingText');
        if (isLoading) return;
        const dateRange = instance.dateRangeValue.get();
        const org = instance.getCurrentOrg();
        if (!(org && dateRange)) return;
        search(org, dateRange, receivedCount, instance.searchCallback);
      });
    }
  });
});

Template.dicomListToolbar.onDestroyed(() => {
  const instance = Template.instance();
  instance.datePicker.remove();
});

Template.dicomListToolbar.helpers({
  disableImportBtn() {
    const instance = Template.instance();
    const org = instance.getCurrentOrg();
    return !org || !Roles.userIsInRole(Meteor.user(), 'js', org._id) || JF.dicomlist.getSelectedDicomIds().length === 0;
  },
  disableImportAllBtn() {
    const instance = Template.instance();
    const total = instance.data.statusData.total.get();
    const imported = JF.managers.importDicom.numberOfImported();
    const org = instance.getCurrentOrg();
    return !org || !Roles.userIsInRole(Meteor.user(), 'js', org._id) || total === imported;
  }
});

Template.dicomListToolbar.events({
  'change #organization'(event, instance) {
    const index = event.currentTarget.options.selectedIndex;
    instance.orgIndex.set(index);
  },

  'change #dicomDate'(event, instance) {
    const val = $(event.currentTarget).val();
    instance.dateRangeValue.set(val);
  },
  'click #importStudies'(event, instance) {
    JF.dicomlist.importSelectedDicoms();
  },
  'click #importAllStudies'(event, instance) {
    JF.dicomlist.loadDicomsProgress(instance.data).then(() => {
      const dicoms = JF.managers.importDicom.unimportedDicoms();
      JF.dicomlist.importDicomsProgress(dicoms);
    });
  }
});
