import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Template.orderlistView.onCreated(() => {
  const instance = Template.instance();
  instance.autorun(() => {
    instance.subscribe('orders');
  });

  instance.sortOptions = new ReactiveVar();
  instance.sortingColumns = new ReactiveDict();
  instance.filterOptions = new ReactiveDict();

  instance.paginationData = {
    class: 'orderlist-pagination',
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
})

Template.orderlistView.onRendered(() => {
  const instance = Template.instance();

    // Initialize daterangepicker
    const today = moment();
    const lastWeek = moment().subtract(1, 'week');
    const lastMonth = moment().subtract(1, 'month');
    const lastThreeMonth = moment().subtract(3, 'month');
    const $orderTime = instance.$('#orderTime');
    const $reportTime = instance.$('#reportTime');
    const $reviewTime = instance.$('#reviewTime');

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
    instance.reportTimePicker = $reportTime.daterangepicker(config).data('daterangepicker');
    instance.reviewTimePicker = $reviewTime.daterangepicker(config).data('daterangepicker');
})

Template.orderlistView.onDestroyed(() => {
  const instance = Template.instance();
  instance.orderTimePicker.remove();
  instance.reportTimePicker.remove();
  instance.reviewTimePicker.remove();
})

Template.orderlistView.helpers({
  orders() {
    const instance = Template.instance();
    let orders;
    let sortOption = {
        patientName: 1,
        orderTime: 1
    };

    // Pagination parameters
    const rowsPerPage = instance.paginationData.rowsPerPage.get();
    const currentPage = instance.paginationData.currentPage.get();
    const offset = rowsPerPage * currentPage;
    const limit = offset + rowsPerPage;

    orders = JF.collections.orders.find({}, {
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
})

Template.orderlistView.events({
  'change #status-selector'(event, instance) {
    const index = event.currentTarget.options.selectedIndex;
    console.log(index);
  },
  'show.daterangepicker #reportTime'(event, instance) {
    instance.reportTimePicker.autoUpdateInput = true;
  },
  'show.daterangepicker #reviewTime'(event, instance) {
    instance.reviewTimePicker.autoUpdateInput = true;
  },
  'cancel.daterangepicker #reportTime, cancel.daterangepicker #reviewTime'(event, instance) {
    $(event.currentTarget).val('');
  }
})
