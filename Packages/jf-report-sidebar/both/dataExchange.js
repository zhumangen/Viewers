import { OHIF } from 'meteor/ohif:core';
import { HTTP } from 'meteor/http';
import { JF } from 'meteor/jf:core';

const api = 'http://101.132.45.197:8686/v2/rmis/sysop/rmisReprot';

export const getHiReport = options => {
    OHIF.log.info('Get origin report');

    return new Promise((resolve, reject) => {
        // const api = options.originReportApi;
        const studyUid = options.studyInstanceUid;
        const sopUid = options.sopInstanceUid;
        
        api += '/' + studyUid;
        api += '/' + sopUid;
        
        const headers = { token: options.token, version: options.version };
        HTTP.call('GET', api, { headers }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                if (result.data) {
                    if (result.data.code === 200) {
                        resolve(result.data.data);
                    } else {
                        reject(result.data);
                    }
                } else {
                    reject(result);
                }
            }
        });
    });
};

export const getAiReport = options => {
    OHIF.log.info('Get ai report');

    return new Promise((resolve, reject) => {
        const api = options.aiReportApi;
        const studyUid = options.studyInstanceUid;
        const sopUid = options.sopInstanceUid;
        
        api += '/' + studyUid;
        api += '/' + sopUid;
        
        const headers = { token: options.token, version: options.version };
        HTTP.call('GET', api, { headers }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                if (result.data) {
                    if (result.data.code === 200) {
                        resolve(result.data.data);
                    } else {
                        reject(result.data);
                    }
                } else {
                    reject(result);
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
