import { OHIF } from 'meteor/ohif:core';
import { HTTP } from 'meteor/http';
import { JF } from 'meteor/jf:core';

const hiPath = 'http://101.132.45.197:8686/v2/rmis/sysop/rmisReprot';
const aiPath = 'http://47.100.41.69:8091/report';

export const getHiReport = options => {
    OHIF.log.info('Get origin report');

    return new Promise((resolve, reject) => {
        // const api = options.originReportApi;
        const studyUid = options.studyInstanceUid;
        const sopUid = options.sopInstanceUid;
        const api = hiPath;

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
};

export const getAiReport = options => {
    OHIF.log.info('Get ai report');

    return new Promise((resolve, reject) => {
        const api = aiPath;

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
};

JF.report.ReportApi.setConfiguration({
    dataExchange: {
        getHiReport,
        getAiReport
    }
});
