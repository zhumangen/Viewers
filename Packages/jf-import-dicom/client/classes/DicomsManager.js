import { Meteor } from 'meteor/meteor';
import { JF } from 'meteor/jf:core';

export class DicomsManager {
  constructor() {

  }

  queryDicomInfo(options) {
    const org = options.organization;
    const filter = Object.assign({}, org.filter);
    let qido;
    if (org.queryLevel === 'study') {
      filter.studyDateFrom = options.dateFrom;
      filter.studyDateTo = options.dateTo;
      qido = JF.studies.searchStudies;
    } else if (org.queryLevel === 'series'){
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

  storeDicom(options) {
    return new Promise((resolve, reject) => {
      Meteor.call('storeDicom', options, (error, response) => {

      })
    });
  }
}
