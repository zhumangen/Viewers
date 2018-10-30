import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

Template.dicomListView.onCreated(() => {
  const instance = Template.instance();

  instance.sortingColumns = {
    patientName: 1,
    patientSex: 0,
    patientAge: 0,
    studyDate: -1,
    patientId: 0,
    modality: 0
  }
})

Template.dicomListView.helpers({
  dicoms() {
    const instance = Template.instance();
    let dicoms;
    let sortOption = {
        patientName: 1,
        studyDate: -1
    };

    // Pagination parameters
    const rowsPerPage = instance.data.paginationData.rowsPerPage.get();
    const currentPage = instance.data.paginationData.currentPage.get();
    const offset = rowsPerPage * currentPage;
    const limit = offset + rowsPerPage;

    dicoms = JF.collections.importDicoms.find().fetch();

    if (!dicoms) {
        return;
    }

    // Limit studies
    return dicoms.slice(offset, limit);
  },

  numberOfRecords() {
    return Template.instance().data.paginationData.recordCount.get();
  },

  sortingColumnsIcons() {
    const instance = Template.instance();

    let sortingColumnsIcons = {};
    Object.keys(instance.sortingColumns).forEach(key => {
        const value = instance.sortingColumns[key];

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
