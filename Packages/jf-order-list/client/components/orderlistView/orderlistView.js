import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';
import { ReactiveVar } from 'meteor/reactive-var';

Template.orderlistView.onCreated(() => {
  JF.orderlist.clearSelections();

  const instance = Template.instance();
  instance.sortOption = new ReactiveVar({ orderTime: -1 });
  instance.filterOptions = new ReactiveVar({});
  instance.orderFilter = new ReactiveVar({});

  instance.autorun(() => {
    const type = Session.get('locationType');
    const filter = instance.orderFilter.get();
    if (filter.orderTime) {
      instance.subscribe('orders', { type, filter });
    }
  });

  instance.paginationData = {
    class: 'orderlist-pagination',
    currentPage: new ReactiveVar(0),
    rowsPerPage: new ReactiveVar(JF.managers.settings.rowsPerPage()),
    recordCount: new ReactiveVar(0)
  };

  instance.autorun(() => {
    const orders = JF.collections.orders.find({}, { fields: { studyOrgId: 1, reporterId: 1, reviewerId: 1 }});
    const orgIds = {};
    const userIds = {};
    orders.forEach(o => {
      orgIds[o.studyOrgId] = 1;
      userIds[o.reporterId] = 1;
      userIds[o.reviewerId] = 1;
    });
    Object.keys(orgIds).forEach(id => JF.organization.getOrganization(id));
    Object.keys(userIds).forEach(id => {
      if (id != 'undefined' && id != 'null') {
        JF.user.getUser(id);
      }
    });
  });
});

Template.orderlistView.onRendered(() => {
  const instance = Template.instance();

  // Initialize daterangepicker
  const today = moment();
  const lastWeek = moment().subtract(1, 'week');
  const lastMonth = moment().subtract(1, 'month');
  const lastThreeMonth = moment().subtract(3, 'month');
  const $orderTime = instance.$('#orderTime');
  const $reportEnd = instance.$('#reportEnd');
  const $reviewEnd = instance.$('#reviewEnd');

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

  Object.assign(config, JF.ui.datePickerConfig);
  instance.orderTimePicker = $orderTime.daterangepicker(config).data('daterangepicker');
  config.autoUpdateInput = false;
  instance.reportEndPicker = $reportEnd.daterangepicker(config).data('daterangepicker');
  instance.reviewEndPicker = $reviewEnd.daterangepicker(config).data('daterangepicker');
});

Template.orderlistView.onDestroyed(() => {
  const instance = Template.instance();
  instance.orderTimePicker.remove();
  instance.reportEndPicker.remove();
  instance.reviewEndPicker.remove();
});

Template.orderlistView.helpers({
  tableTitle() {
    return Session.get('locationType')==='SCP'?'标注列表':'申请列表';
  },
  orders() {
    const instance = Template.instance();
    let orders;
    let sortOption = instance.sortOption.get();
    let filterOptions = instance.filterOptions.get();

    // Pagination parameters
    const rowsPerPage = instance.paginationData.rowsPerPage.get();
    const currentPage = instance.paginationData.currentPage.get();
    const offset = rowsPerPage * currentPage;
    const limit = offset + rowsPerPage;

    orders = JF.collections.orders.find(filterOptions, {
        sort: sortOption
    }).fetch();

    if (!orders) {
        return;
    }

    // Update record count
    instance.paginationData.recordCount.set(orders.length);

    // Limit orders
    return orders.slice(offset, limit);
  },
  numberOfOrders() {
    return Template.instance().paginationData.recordCount.get();
  },
  sortingColumnsIcons() {
    const instance = Template.instance();

    let sortIcons = {
      status: 'fa fa-fw',
      serialNumber: 'fa fa-fw',
      lesionCode: 'fa fa-fw',
      patientName: 'fa fa-fw',
      patientSex: 'fa fa-fw',
      patientAge: 'fa fa-fw',
      modalities: 'fa fa-fw',
      bodyPartExamined: 'fa fa-fw',
      orderTime: 'fa fa-fw',
      studyOrgId: 'fa fa-fw',
      reporterId: 'fa fa-fw',
      reportEnd: 'fa fa-fw',
      reviewerId: 'fa fa-fw',
      reviewEnd: 'fa fa-fw'
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
      label: '待标注'
    }, {
      value: 1,
      label: '标注中'
    }, {
      value: 2,
      label: '待审核'
    }, {
      value: 3,
      label: '审核中'
    }, {
      value: 4,
      label: '已审核'
    }];

    if (Session.get('locationType') === 'SCU') {
      items.splice(items.length, 0, {
        value: 10,
        label: '已拒绝'
      }, {
        value: 11,
        label: '已撤回'
      });
    }

    items.unshift(JF.ui.selectNoneItem);
    return items;
  },
  lesionCodeItems() {
    const items = JF.lesiontracker.getLesionCodes();
    items.unshift(JF.ui.selectNoneItem);
    return items;
  },
  studyOrgItems() {
    return JF.organization.getLocalOrgItems.call(JF.organization.organizations, [], { type: 'SCU' });
  },
  reportPhyItems() {
    return JF.user.getUserItems('bg');
  },
  reviewPhyItems() {
    return JF.user.getUserItems('sh');
  }
});

Template.orderlistView.events({
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
        case 'lesionCode':
        case 'patientSex':
        case 'studyOrgId':
        case 'reporterId':
        case 'reviewerId':
          filterOptions[id] = value;
          break;
        case 'serialNumber':
        case 'patientName':
        case 'patientAge':
        case 'bodyPartExamined':
        case 'modalities':
          filterOptions[id] = { $regex: value };
          break;
        case 'orderTime':
        case 'reportEnd':
        case 'reviewEnd':
          const ranges = value.split('-');
          if (ranges.length === 2) {
            const start = new Date(ranges[0] + ' 00:00:00');
            const end = new Date(ranges[1] + ' 23:59:59');
            const val = { $gte: start, $lte: end };
            if (id === 'orderTime') {
              const filter = instance.orderFilter.get();
              filter[id] = val;
              instance.orderFilter.set(filter);
            } else {
              filterOptions[id] = val;
            }
          }
          break;
      }

      instance.paginationData.currentPage.set(0);
    } else {
      delete filterOptions[id];
    }

    instance.filterOptions.set(filterOptions);
  },
  'show.daterangepicker #reportEnd'(event, instance) {
    instance.reportEndPicker.autoUpdateInput = true;
  },
  'show.daterangepicker #reviewEnd'(event, instance) {
    instance.reviewEndPicker.autoUpdateInput = true;
  },
  'cancel.daterangepicker #reportEnd, cancel.daterangepicker #reviewEnd'(event, instance) {
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
