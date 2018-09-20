import { OHIF } from 'meteor/ohif:core';
import { HTTP } from 'meteor/http';
import { JF } from 'meteor/jf:core';
import { ReportsManager } from './ReportsManager';

const getHiReport = options => {
  OHIF.log.info('Get origin report');

  return new Promise((resolve, reject) => {
    JF.managers.settings.rmisApis().then(apis => {
      let api = apis.root + apis.report;
      const studyUid = options.studyInstanceUid;
      const sopUid = options.sopInstanceUid;

      // studyUid = '1.2.156.14702.18.1.1.220180608104226982';
      // sopUid = '1.2.156.14702.18.1.3.420180608104338385.20180608104338';
      api += '/' + studyUid;
      api += '/' + sopUid;

      const headers = { token: options.token, version: options.version };
      HTTP.call('GET', api, { headers }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            if (result.data && result.data.code === 200) {
              resolve(result.data.data);
            } else {
              resolve({});
            }
          }
      });
    });
  });
};

const getAiReport = options => {
  OHIF.log.info('Get ai report');

  return new Promise((resolve, reject) => {
    JF.managers.settings.aiApis().then(apis => {
      const api = apis.root + apis.report;
      const headers = {};
      headers['Accept'] = 'application/json';
      headers['Content-Type'] = 'application/json'
      const data = options.data;
      HTTP.call('POST', api, { headers, data }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            if (result.data && result.data.code === 200) {
              resolve(result.data.data);
            } else {
              resolve({});
            }
          }
      });
    });
  });
};

ReportsManager.setConfiguration({
    dataExchange: {
        getHiReport,
        getAiReport
    }
});
