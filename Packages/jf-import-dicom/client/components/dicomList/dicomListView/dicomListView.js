import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { _ } from 'meteor/underscore';
import { ReactiveVar } from 'meteor/reactive-var';

Template.dicomListView.onCreated(() => {
  const instance = Template.instance();

  JF.dicomlist.clearSelections();

  instance.sortOption = new ReactiveVar({ dicomTime: -1 });
  instance.filterOptions = new ReactiveVar({});

  instance.paginationData = {
    class: 'dicomlist-pagination',
    currentPage: new ReactiveVar(0),
    recordCount: new ReactiveVar(0),
    rowsPerPage: new ReactiveVar(JF.managers.settings.rowsPerPage())
  };
  instance.statusData = {
    loaded: new ReactiveVar(0),
    total: new ReactiveVar(0),
    errorMsg: new ReactiveVar('')
  };

  instance.orgItems = new ReactiveVar([]);
});

Template.dicomListView.onRendered(() => {
  const instance = Template.instance();

  // Initialize daterangepicker
  const today = moment();
  const lastWeek = moment().subtract(1, 'week');
  const lastMonth = moment().subtract(1, 'month');
  const lastThreeMonth = moment().subtract(3, 'month');
  const $dicomTime = instance.$('#dicomTime');

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

  Object.assign(config, JF.ui.datePickerConfig);
  instance.dicomTimePicker = $dicomTime.daterangepicker(config).data('daterangepicker');
});

Template.dicomListView.onDestroyed(() => {
  const instance = Template.instance();
  instance.dicomTimePicker.remove();
});

Template.dicomListView.helpers({
  dicoms() {
    const instance = Template.instance();
    let dicoms;
    let sortOption = instance.sortOption.get();
    let filterOptions = instance.filterOptions.get();

    // Pagination parameters
    const rowsPerPage = instance.paginationData.rowsPerPage.get();
    const currentPage = instance.paginationData.currentPage.get();
    const offset = rowsPerPage * currentPage;
    const limit = offset + rowsPerPage;

    dicoms = JF.collections.importDicoms.find(filterOptions, {
      sort: sortOption
    }).fetch();

    if (!dicoms) {
        return;
    }
    // Update record count
    instance.paginationData.recordCount.set(dicoms.length);

    // Limit studies
    return dicoms.slice(offset, limit);
  },

  numberOfRecords() {
    return Template.instance().paginationData.recordCount.get();
  },

  sortingColumnsIcons() {
    const instance = Template.instance();

    let sortIcons = {
      status: 'fa fa-fw',
      qidoLevel: 'fa fa-fw',
      accessionNumber: 'fa fa-fw',
      patientName: 'fa fa-fw',
      patientSex: 'fa fa-fw',
      patientAge: 'fa fa-fw',
      modalities: 'fa fa-fw',
      bodyPartExamined: 'fa fa-fw',
      dicomTime: 'fa fa-fw',
      institutionName: 'fa fa-fw',
      descripton: 'fa fa-fw'
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
      label: '未导入'
    }, {
      value: 1,
      label: '已导入'
    }];
    items.unshift(JF.ui.selectNoneItem);
    return items;
  }
});

Template.dicomListView.events({
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
        case 'qidoLevel':
        case 'patientSex':
          filterOptions[id] = value;
          break;
        case 'accessionNumber':
        case 'patientName':
        case 'patientAge':
        case 'bodyPartExamined':
        case 'modalities':
        case 'institutionName':
        case 'descripton':
          filterOptions[id] = { $regex: value };
          break;
        case 'dicomTime':
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
