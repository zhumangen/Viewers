import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Template.dicomListView.onCreated(() => {
  JF.dicomlist.clearSelections();
  const instance = Template.instance();

  instance.paginationData = {
    class: 'dicomlist-pagination',
    currentPage: new ReactiveVar(0),
    recordCount: new ReactiveVar(0),
    rowsPerPage: new ReactiveVar(JF.managers.settings.rowsPerPage())
  };
  instance.statusData = {
    loadAll: new ReactiveVar(false),
    loaded: new ReactiveVar(0),
    total: new ReactiveVar(0),
    errorMsg: new ReactiveVar('')
  };

  instance.filterOptions = new ReactiveVar();
  instance.sortingColumns = new ReactiveVar({
    status: 0,
    qidoLevel: 0,
    patientId: 0,
    patientName: 0,
    patientSex: 0,
    patientAge: 0,
    dicomDate: -1,
    institution: 0,
    modality: 0,
    bodyPart: 0,
    description: 0
  });
})

Template.dicomListView.helpers({
  dicoms() {
    const instance = Template.instance();
    let dicoms;
    let sort = {};
    let filter = {};
    // const sort = instance.sortOptions.get();
    // const filter = instance.filterOptions.get();

    // Pagination parameters
    const rowsPerPage = instance.paginationData.rowsPerPage.get();
    const currentPage = instance.paginationData.currentPage.get();
    const offset = rowsPerPage * currentPage;
    const limit = offset + rowsPerPage;

    dicoms = JF.collections.importDicoms.find(filter, sort).fetch();

    if (!dicoms) {
        return;
    }

    // Limit studies
    return dicoms.slice(offset, limit);
  },

  numberOfRecords() {
    return Template.instance().paginationData.recordCount.get();
  },

  sortingColumnsIcons() {
    const instance = Template.instance();

    let sortingColumnsIcons = {};
    const sortingColumns = instance.sortingColumns.get();
    Object.keys(sortingColumns).forEach(key => {
        const value = sortingColumns[key];

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

Template.dicomListView.events({
  'change #status-select'(event, instance) {
    const index = event.currentTarget.options.selectedIndex;

  }
})
