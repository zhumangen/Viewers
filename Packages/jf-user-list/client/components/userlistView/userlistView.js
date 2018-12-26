import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Template.userlistView.onCreated(() => {
  const instance = Template.instance();
  instance.subscribe('users');
  instance.subscribe('organizations');

  instance.sortOptions = new ReactiveVar();
  instance.sortingColumns = new ReactiveDict();
  instance.filterOptions = new ReactiveDict();

  instance.paginationData = {
    class: 'userlist-pagination',
    currentPage: new ReactiveVar(0),
    rowsPerPage: new ReactiveVar(JF.managers.settings.rowsPerPage()),
    recordCount: new ReactiveVar(0)
  };

  instance.sortingColumns.set({
    userName: 1,
    userTime: 1,
    userType: 0,
    serialNumber: 0,
    userFullName: 0
  });
})

Template.userlistView.onRendered(() => {
  const instance = Template.instance();

    // Initialize daterangepicker
    const today = moment();
    const lastWeek = moment().subtract(1, 'week');
    const lastMonth = moment().subtract(1, 'month');
    const lastThreeMonth = moment().subtract(3, 'month');
    const $userTime = instance.$('#userTime');

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
    instance.userTimePicker = $userTime.daterangepicker(config).data('daterangepicker');
})

Template.userlistView.onDestroyed(() => {
  const instance = Template.instance();
  instance.userTimePicker.remove();
})

Template.userlistView.helpers({
  users() {
    const instance = Template.instance();
    let users;
    let sortOption = {
        createdAt: 1,
        name: 1
    };

    // Pagination parameters
    const rowsPerPage = instance.paginationData.rowsPerPage.get();
    const currentPage = instance.paginationData.currentPage.get();
    const offset = rowsPerPage * currentPage;
    const limit = offset + rowsPerPage;

    users = Meteor.users.find({}, {
        sort: sortOption
    }).fetch();

    if (!users) {
        return;
    }

    // Update record count
    instance.paginationData.recordCount.set(users.length);

    // Limit orders
    return users.slice(offset, limit);
  },
  numberOfUsers() {
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

Template.userlistView.events({
  'show.daterangepicker #userTime'(event, instance) {
    instance.userTimePicker.autoUpdateInput = true;
  },
  'cancel.daterangepicker #userTime'(event, instance) {
    $(event.currentTarget).val('');
  }
})
