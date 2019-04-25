import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { moment } from 'meteor/momentjs:moment';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';

Template.studylistResult.helpers({
  studies() {
    return JF.collections.studies.find().fetch();
  },

  numberOfStudies() {
    return Template.instance().paginationData.recordCount.get();
  },

  sortingColumnsIcons() {
    const instance = Template.instance();

    let sortIcons = {
      status: 'fa fa-fw',
      serialNumber: 'fa fa-fw',
      patientName: 'fa fa-fw',
      patientSex: 'fa fa-fw',
      patientAge: 'fa fa-fw',
      modalities: 'fa fa-fw',
      bodyPartExamined: 'fa fa-fw',
      dicomTime: 'fa fa-fw',
      createdAt: 'fa fa-fw',
      organizationId: 'fa fa-fw',
      description: 'fa fa-fw'
    };
    const sortOption = instance.sortOption.get();
    Object.keys(sortOption).forEach(key => {
      const value = sortOption[key];
      if (value === 1) {
        sortIcons[key] = 'fa fa-fw fa-sort-up';
      } else if (value === -1) {
        sortIcons[key] = 'fa fa-fw fa-sort-down';
      }
    });
    return sortIcons;
  },
  statusItems() {
    const items = [{
      value: 0,
      label: '未申请'
    }, {
      value: 1,
      label: '已申请'
    }];
    items.unshift(JF.ui.selectNoneItem);
    return items;
  },
  orgItems() {
    return JF.organization.getLocalOrgItems.call(JF.organization.organizations, [], { type: 'SCU' });
  }
});

Template.studylistResult.onCreated(() => {
    JF.studylist.clearSelections();

    const instance = Template.instance();
    instance.sortOption = new ReactiveVar({ createdAt: -1 });
    instance.filterOptions = new ReactiveVar({});

    instance.paginationData = {
        class: 'studylist-pagination',
        currentPage: new ReactiveVar(0),
        rowsPerPage: new ReactiveVar(JF.managers.settings.rowsPerPage()),
        recordCount: new ReactiveVar(0)
    };
    
    instance.autorun(() => {
      const filters = instance.filterOptions.get();
      const sort = instance.sortOption.get();
      const limit = instance.paginationData.rowsPerPage.get();
      const skip = limit * instance.paginationData.currentPage.get();
      if (filters.createdAt) {
        instance.subscribe('studies', { filters, sort, limit, skip });
      }
    });

    instance.subscribe('studiesCount');

    instance.autorun(() => {
      let count = 0;
      const rec = JF.collections.studiesCount.findOne({});
      if (rec) {
        count = rec.count;
      }
      instance.paginationData.recordCount.set(count);
    });
});

Template.studylistResult.onRendered(() => {
  const instance = Template.instance();

  // Initialize daterangepicker
  const today = moment();
  const lastWeek = moment().subtract(1, 'week');
  const lastMonth = moment().subtract(1, 'month');
  const lastThreeMonth = moment().subtract(3, 'month');
  const $dicomTime = instance.$('#dicomTime');
  const $createdAt = instance.$('#createdAt');

  const config = {
    maxDate: today,
    autoUpdateInput: false,
    startDate: lastWeek,
    endDate: today,
    ranges: {
      '今天': [today, today],
      '最近一周': [lastWeek, today],
      '最近一月': [lastMonth, today],
      '最近三月': [lastThreeMonth, today]
    }
  };

  instance.dicomTimePicker = $dicomTime.daterangepicker(Object.assign(config, JF.ui.datePickerConfig)).data('daterangepicker');
  config.autoUpdateInput = true;
  instance.createdAtPicker = $createdAt.daterangepicker(Object.assign(config, JF.ui.datePickerConfig)).data('daterangepicker');
});

Template.studylistResult.onDestroyed(() => {
    const instance = Template.instance();

    // Destroy the daterangepicker to prevent residual elements on DOM
    instance.dicomTimePicker.remove();
    instance.createdAtPicker.remove();
});

function resetSortingColumns(instance, sortingColumn) {
    Object.keys(instance.sortingColumns.keys).forEach(key => {
        if (key !== sortingColumn) {
            instance.sortingColumns.set(key, null);
        }
    });
}

Template.studylistResult.events({
  'change input, keydown input, change select'(event, instance) {
    if (event.type === 'keydown' && event.which !== 13) {
      return;
    }

    const comp = $(event.currentTarget).data('component');
    const value = comp.value();
    const id = event.currentTarget.id;
    const filterOptions = instance.filterOptions.get();

    if (value && value !== 'none') {
      switch (id) {
        case 'status':
          value = parseInt(value);
        case 'patientSex':
        case 'organizationId':
          filterOptions[id] = value;
          break;
        case 'serialNumber':
        case 'patientName':
        case 'patientAge':
        case 'bodyPartExamined':
        case 'modalities':
        case 'description':
          filterOptions[id] = { $regex: value };
          break;
        case 'dicomTime':
        case 'createdAt':
          const ranges = value.split('-');
          if (ranges.length === 2) {
            const start = new Date(ranges[0] + ' 00:00:00');
            const end = new Date(ranges[1] + ' 23:59:59');
            filterOptions[id] = { $gte: start, $lte: end };
          }
          break;
      }

      instance.paginationData.currentPage.set(0);
    } else {
      delete filterOptions[id];
    }

    instance.filterOptions.set(filterOptions);
  },
  'show.daterangepicker #dicomTime'(event, instance) {
    instance.dicomTimePicker.autoUpdateInput = true;
  },
  'cancel.daterangepicker #dicomTime'(event, instance) {
    $(event.currentTarget).val('');
    const id = event.currentTarget.id;
    const filterOptions = instance.filterOptions.get();
    delete filterOptions[id];
    instance.filterOptions.set(filterOptions);
  },
  'click div.sortingCell'(event, instance) {
    const eleId = event.currentTarget.id;
    const id = eleId.replace('_', '');
    let sortOption = instance.sortOption.get();
    const value = sortOption[id]? (sortOption[id] * -1) : 1;
    sortOption = {};
    sortOption[id] = value;
    instance.sortOption.set(sortOption);
  }
});
