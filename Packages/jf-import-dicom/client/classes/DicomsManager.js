import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

export class DicomsManager {
  constructor() {

  }

  numberOfImported() {
    const collection = JF.collections.importDicoms;
    const filter = { imported: true };
    return collection.find(filter).count();
  }

  unimportedDicoms() {
    const collection = JF.collections.importDicoms;
    const filter = { $or: [{
      imported: { $exists: false }
    }, {
      imported: false
    }] };
    return collection.find(filter).fetch();
  }

  markImported(dicoms) {
    const collection = JF.collections.importDicoms;
    dicoms.forEach(dicom => {
      const filter = { _id: dicom._id };
      const operation = { $set: { imported: true } }
      collection.update(filter, operation, { upsert: false, multi: false });
    });
  }

  queryDicomInfo(options) {
    const org = options.organization;
    const filter = Object.assign({}, org.filter);
    const level = org.queryLevel.toUpperCase();
    let qido;
    if (level === 'STUDY') {
      filter.studyDateFrom = options.dateFrom;
      filter.studyDateTo = options.dateTo;
      qido = JF.studies.searchStudies;
    } else if (Level === 'SERIES'){
      filter.seriesDateFrom = options.dateFrom;
      filter.seriesDateTo = options.dateTo;
      qido = JF.studies.searchSeries;
    }

    return new Promise((resolve, reject) => {
      if (qido) {
        qido(org.serverId, filter).then(resolve).catch(reject);
      } else {
        reject(new Error('No search function found.'));
      }
    });
  }

  storeDicoms(dicoms) {
    return new Promise((resolve, reject) => {
      Meteor.call('storeDicoms', dicoms, {}, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
}
