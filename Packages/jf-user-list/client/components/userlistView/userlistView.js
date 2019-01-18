import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Template.userlistView.onCreated(() => {
  JF.userlist.clearSelections();

  const instance = Template.instance();
  instance.subscribe('users');
  instance.subscribe('organizations');

  instance.sortOption = new ReactiveVar({ lastLoginDate: -1 });
  instance.filterOptions = new ReactiveVar({});

  instance.paginationData = {
    class: 'userlist-pagination',
    currentPage: new ReactiveVar(0),
    rowsPerPage: new ReactiveVar(JF.managers.settings.rowsPerPage()),
    recordCount: new ReactiveVar(0)
  };
});

Template.userlistView.onRendered(() => {
  const instance = Template.instance();

  // Initialize daterangepicker
  const today = moment();
  const lastWeek = moment().subtract(1, 'week');
  const lastMonth = moment().subtract(1, 'month');
  const lastThreeMonth = moment().subtract(3, 'month');
  const $createdAt = instance.$('#createdAt');
  const $lastLogin = instance.$('#lastLoginDate');

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
  instance.createdAtPicker = $createdAt.daterangepicker(config).data('daterangepicker');
  instance.lastLoginPicker = $lastLogin.daterangepicker(config).data('daterangepicker');
});

Template.userlistView.onDestroyed(() => {
  const instance = Template.instance();
  instance.createdAtPicker.remove();
  instance.lastLoginPicker.remove();
});

Template.userlistView.helpers({
  users() {
    const instance = Template.instance();
    let users;
    let sortOption = instance.sortOption.get();
    let filterOptions = instance.filterOptions.get();

    // Pagination parameters
    const rowsPerPage = instance.paginationData.rowsPerPage.get();
    const currentPage = instance.paginationData.currentPage.get();
    const offset = rowsPerPage * currentPage;
    const limit = offset + rowsPerPage;

    users = Meteor.users.find(filterOptions, {
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

    let sortIcons = {
      userId: 'fa fa-fw',
      userName: 'fa fa-fw',
      createdAt: 'fa fa-fw',
      lastLoginDate: 'fa fa-fw',
      userOrgs: 'fa fa-fw'
    };
    const sortOption = instance.sortOption.get();
    Object.keys(sortOption).forEach(key => {
        const value = sortOption[key];
        const prefix = key.split('.').shift();
        switch (prefix) {
          case 'emails':
            key = 'userId';
            break;
          case 'profile':
            key = 'userName';
            break;
          case 'roles':
            key = 'userOrgs';
            break;
        }

        if (value === 1) {
          sortIcons[key] = 'fa fa-fw fa-sort-up';
        } else if (value === -1) {
          sortIcons[key] = 'fa fa-fw fa-sort-down';
        }
    });
    return sortIcons;
  },
  orgNameItems() {
    return JF.organization.getLocalOrgItems.call(JF.collections.organizations, []);
  }
});

Template.userlistView.events({
  'change input, keydown input, change select'(event, instance) {
    if (event.type === 'keydown' && event.which !== 13) {
      return;
    }

    const comp = $(event.currentTarget).data('component');
    const value = comp.value();
    const id = event.currentTarget.id;
    switch (id) {
      case 'userId':
        id = 'emails.address';
        break;
      case 'userName':
        id = 'profile.fullName';
        break;
    }
    const filterOptions = instance.filterOptions.get();

    if (value && value !== 'none') {
      switch (id) {
        case 'emails.address':
        case 'profile.fullName':
          filterOptions[id] = { $regex: value };
          break;
        case 'createdAt':
        case 'lastLoginDate':
          const ranges = value.split('-');
          if (ranges.length === 2) {
            const start = new Date(ranges[0] + ' 00:00:00');
            const end = new Date(ranges[1] + ' 23:59:59');
            filterOptions[id] = { $gte: start, $lte: end };
          }
          break;
        case 'userOrgs':
          const keys = Object.keys(filterOptions);
          for (let k of keys) {
            if (k.split('.').shift() === 'roles') {
              delete filterOptions[k];
              break;
            }
          }
          filterOptions[`roles.${value}`] = { $exists: true };
          break;
      }

      instance.paginationData.currentPage.set(0);
    } else {
      if (id === 'userOrgs') {
        const keys = Object.keys(filterOptions);
        for (let k of keys) {
          if (k.split('.').shift() === 'roles') {
            id = k;
            break;
          }
        }
      }
      delete filterOptions[id];
    }

    instance.filterOptions.set(filterOptions);
  },
  'show.daterangepicker #createdAt'(event, instance) {
    instance.createdAtPicker.autoUpdateInput = true;
  },
  'show.daterangepicker #lastLoginDate'(event, instance) {
    instance.lastLoginPicker.autoUpdateInput = true;
  },
  'cancel.daterangepicker #createdAt, cancel.daterangepicker #lastLoginDate'(event, instance) {
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
    switch (id) {
      case 'userId':
        id = 'emails.address';
        break;
      case 'userName':
        id = 'profile.fullName';
        break;
      case 'userOrgs':
        return;
    }

    const value = sortOption[id]? (sortOption[id] * -1) : 1;
    sortOption = {};
    sortOption[id] = value;
    instance.sortOption.set(sortOption);
  }
});
