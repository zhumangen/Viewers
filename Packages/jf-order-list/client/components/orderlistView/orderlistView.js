import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Template.orderlistView.onCreated(() => {
  JF.orderlist.clearSelections();
  const instance = Template.instance();
  instance.autorun(() => {
    const type = Session.get('locationType');
    instance.subscribe('orders', { type });
  });

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
});

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
});

Template.orderlistView.onDestroyed(() => {
  const instance = Template.instance();
  instance.orderTimePicker.remove();
  instance.reportTimePicker.remove();
  instance.reviewTimePicker.remove();
});

Template.orderlistView.helpers({
  tableTitle() {
    return Session.get('locationType')==='SCP'?'标注列表':'申请列表';
  },
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
  lesionTypeItems() {
    const items = JF.lesiontracker.getLesionCodes();
    items.unshift(JF.ui.selectNoneItem);
    return items;
  },
  institutionItems() {
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
  'change #status'(event, instance) {
    const comp = $(event.currentTarget).data('component');
    console.log(comp.value());
  },
  'change #lesionType'(event, instance) {
    const comp = $(event.currentTarget).data('component');
    console.log(comp.value());
  },
  'change #patientSex'(event, instance) {
    const comp = $(event.currentTarget).data('component');
    console.log(comp.value());
  },
  'change #institution'(event, instance) {
    const comp = $(event.currentTarget).data('component');
    console.log(comp.value());
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
});
