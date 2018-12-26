import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Template.organizationlistView.onCreated(() => {
  const instance = Template.instance();
  instance.subscribe('organizations');

  instance.sortOptions = new ReactiveVar();
  instance.sortingColumns = new ReactiveDict();
  instance.filterOptions = new ReactiveDict();

  instance.paginationData = {
    class: 'organizationlist-pagination',
    currentPage: new ReactiveVar(0),
    rowsPerPage: new ReactiveVar(JF.managers.settings.rowsPerPage()),
    recordCount: new ReactiveVar(0)
  };

  instance.sortingColumns.set({
    organizationName: 1,
    organizationTime: 1,
    organizationType: 0,
    serialNumber: 0,
    organizationFullName: 0
  });
})

Template.organizationlistView.onRendered(() => {
  const instance = Template.instance();

    // Initialize daterangepicker
    const today = moment();
    const lastWeek = moment().subtract(1, 'week');
    const lastMonth = moment().subtract(1, 'month');
    const lastThreeMonth = moment().subtract(3, 'month');
    const $organizationTime = instance.$('#organizationTime');

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
    instance.organizationTimePicker = $organizationTime.daterangepicker(config).data('daterangepicker');
})

Template.organizationlistView.onDestroyed(() => {
  const instance = Template.instance();
  instance.organizationTimePicker.remove();
})

Template.organizationlistView.helpers({
  organizations() {
    const instance = Template.instance();
    let organizations;
    let sortOption = {
        createdAt: 1,
        name: 1
    };

    // Pagination parameters
    const rowsPerPage = instance.paginationData.rowsPerPage.get();
    const currentPage = instance.paginationData.currentPage.get();
    const offset = rowsPerPage * currentPage;
    const limit = offset + rowsPerPage;

    organizations = JF.collections.organizations.find({}, {
        sort: sortOption
    }).fetch();

    if (!organizations) {
        return;
    }

    // Update record count
    instance.paginationData.recordCount.set(organizations.length);

    // Limit orders
    return organizations.slice(offset, limit);
  },
  numberOfOrganizations() {
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

Template.organizationlistView.events({
  'show.daterangepicker #organizationTime'(event, instance) {
    instance.organizationTimePicker.autoUpdateInput = true;
  },
  'cancel.daterangepicker #organizationTime'(event, instance) {
    $(event.currentTarget).val('');
  }
})
