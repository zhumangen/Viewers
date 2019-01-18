import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Template.organizationlistView.onCreated(() => {
  JF.organizationlist.clearSelections();

  const instance = Template.instance();
  instance.sortOption = new ReactiveVar({ createdAt: -1 });
  instance.filterOptions = new ReactiveVar({});
  instance.subscribe('organizations');

  instance.paginationData = {
    class: 'organizationlist-pagination',
    currentPage: new ReactiveVar(0),
    rowsPerPage: new ReactiveVar(JF.managers.settings.rowsPerPage()),
    recordCount: new ReactiveVar(0)
  };
});

Template.organizationlistView.onRendered(() => {
  const instance = Template.instance();

    // Initialize daterangepicker
    const today = moment();
    const lastWeek = moment().subtract(1, 'week');
    const lastMonth = moment().subtract(1, 'month');
    const lastThreeMonth = moment().subtract(3, 'month');
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

    Object.assign(config, JF.ui.datePickerConfig);
    instance.createdAtPicker = $createdAt.daterangepicker(config).data('daterangepicker');
})

Template.organizationlistView.onDestroyed(() => {
  const instance = Template.instance();
  instance.createdAtPicker.remove();
})

Template.organizationlistView.helpers({
  organizations() {
    const instance = Template.instance();
    let organizations;
    let sortOption = instance.sortOption.get();
    let filterOptions = instance.filterOptions.get();

    // Pagination parameters
    const rowsPerPage = instance.paginationData.rowsPerPage.get();
    const currentPage = instance.paginationData.currentPage.get();
    const offset = rowsPerPage * currentPage;
    const limit = offset + rowsPerPage;

    organizations = JF.collections.organizations.find(filterOptions, {
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

    let sortIcons = {
      serialNumber: 'fa fa-fw',
      name: 'fa fa-fw',
      orgTypes: 'fa fa-fw',
      createdAt: 'fa fa-fw',
      fullName: 'fa fa-fw'
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
  }
})

Template.organizationlistView.events({
  'change input, keydown input, change select'(event, instance) {
    if (event.type === 'keydown' && event.which !== 13) {
      return;
    }

    const comp = $(event.currentTarget).data('component');
    const value = comp.value();
    const id = event.currentTarget.id;
    if (id === 'orgName') id = 'name';
    else if (id === 'orgFullName') id = 'fullName';
    const filterOptions = instance.filterOptions.get();

    if (value && value !== 'none') {
      switch (id) {
        case 'orgTypes':
          const keys = Object.keys(filterOptions);
          for (let k of keys) {
            if (k.split('.').shift() === 'orgTypes') {
              delete filterOptions[k];
              break;
            }
          }
          filterOptions[`${id}.${value}`] = true;
          break;
        case 'serialNumber':
        case 'name':
        case 'fullName':
          filterOptions[id] = { $regex: value };
          break;
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
      if (id === 'orgTypes') {
        const keys = Object.keys(filterOptions);
        for (let k of keys) {
          if (k.split('.').shift() === 'orgTypes') {
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
  'cancel.daterangepicker #createdAt'(event, instance) {
    $(event.currentTarget).val('');
    const id = event.currentTarget.id;
    const filterOptions = instance.filterOptions.get();
    delete filterOptions[id];
    instance.filterOptions.set(filterOptions);
  },
  'click div.sortingCell'(event, instance) {
    const eleId = event.currentTarget.id;
    const id = eleId.replace('_', '');
    if (id === 'orgName') id = 'name';
    else if (id === 'orgFullName') id = 'fullName';
    let sortOption = instance.sortOption.get();
    const value = sortOption[id]? (sortOption[id] * -1) : 1;
    sortOption = {};
    sortOption[id] = value;
    instance.sortOption.set(sortOption);
  }
})
