import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Tracker } from 'meteor/tracker';
import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';

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

function search(organization, dateRange, offset, callback) {
  OHIF.log.info('dicom list search...');
  Session.set('showLoadingText', true);
  Session.set('serverError', false);

  const filters = {
    patientId: getFilter(organization.filters.patientId),
    institutionName: getFilter(organization.filters.institutionName)
  };
  const level = organization.qidoLevel.toUpperCase();
  const modalities = [];
  if (organization.filters.modalities) {
    Object.keys(organization.filters.modalities).forEach(k => {
      if (organization.filters.modalities[k]) {
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
        if (modalities.length) {
          ok = false;
          for (let m of modalities) {
            if (dicom.modalities && dicom.modalities.indexOf(m) >= 0) {
              ok = true;
              break;
            }
          }
        }
        if (ok) {
          if (_.isString(dicom.patientSex)) dicom.patientSex = dicom.patientSex.toUpperCase();
          if (dicom.patientSex !== 'M' && dicom.patientSex !== 'F') {
            dicom.patientSex = 'O';
          }
          dicom.patientAge = JF.dicomlist.getPatientAge(dicom.patientAge, dicom.patientBirthdate, dicom.seriesDate||dicom.studyDate);
          delete dicom.patientBirthdate;

          if (level === 'INSTANCE') {
            dicom.dicomTime = moment(dicom.contentDate+dicom.contentTime, 'YYYYMMDDHHmmss.SSS').toDate();
          }
          if (level === 'SERIES' || isNaN(dicom.dicomTime.valueOf())) {
            dicom.dicomTime = moment(dicom.seriesDate+dicom.seriesTime, 'YYYYMMDDHHmmss.SSS').toDate();
          }
          if (level === 'STUDY' || isNaN(dicom.dicomTime.valueOf())) {
            dicom.dicomTime = moment(dicom.studyDate+dicom.studyTime, 'YYYYMMDDHHmmss.SSS').toDate();
          }

          if (!isNaN(dicom.numberOfStudyRelatedInstances)) {
            dicom.numberOfStudyRelatedInstances = parseInt(dicom.numberOfStudyRelatedInstances);
          }
          if (!isNaN(dicom.numberOfSSeriesRelatedInstances)) {
            dicom.numberOfSeriesRelatedInstances = parseInt(dicom.numberOfSSeriesRelatedInstances);
          }
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
      OHIF.ui.notifications.warning({ text: callbackData.errorMsg });
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
      JF.collections.importDicoms.remove({});
      instance.data.paginationData.currentPage.set(0);
      search(org, dateRange, 0, instance.searchCallback);
    });
  });

  instance.autorun(() => {
    const loaded = instance.data.statusData.loaded.get();
    const total = instance.data.statusData.total.get();
    const error = instance.data.statusData.errorMsg.get();

    if (loaded < total && !error) {
      Tracker.nonreactive(() => {
        const isLoading = Session.get('showLoadingText');
        if (isLoading) return;
        const dateRange = instance.dateRangeValue.get();
        const org = instance.getCurrentOrg();
        if (!(org && dateRange)) return;
        search(org, dateRange, loaded, instance.searchCallback);
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
    JF.dicomlist.loadDicomsProgress(instance.data.statusData).then(() => {
      const filters = instance.data.filterOptions.get();
      const dicoms = JF.collections.importDicoms.find(filters).fetch();
      JF.dicomlist.importDicomsProgress(dicoms);
    });
  }
});
