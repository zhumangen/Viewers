import { Tracker } from 'meteor/tracker';
import { _ } from 'meteor/underscore';
import { JF } from 'meteor/jf:core';
import { OHIF } from 'meteor/ohif:core';
import { ReactiveDict } from 'meteor/reactive-dict';

let configuration = {};

export class ReportsManager {
    static setConfiguration(config) {
        _.extend(configuration, config);
    }

    static getConfiguration() {
        return configuration;
    }

    constructor() {

    }

    getHiReport(options) {
        const fn = configuration.dataExchange.getHiReport;
        if (!_.isFunction(fn)) {
            return;
        }

        return new Promise((resolve, reject) => {
            fn(options).then(data => {
                OHIF.log.info('origin report: ', data);
                let result = {};
                if (data) {
                  result = {
                      findings: data.reprcdFinding,
                      diagnose: data.reprcdImpression,
                      hp: data.hp
                  };
                }
                resolve(result);
            }).catch(error => {
                OHIF.log.error('Get origin report failed: ', error);
                reject(error);
            })
        });
    }

    getAiReport(options) {
        const fn = configuration.dataExchange.getAiReport;
        if (!_.isFunction(fn)) {
            return;
        }

        return new Promise((resolve, reject) => {
            fn(options).then(data => {
                OHIF.log.info('ai report: ', data);
                let result = {};
                if (data) {
                  result = {
                      findings: data.reprcdFinding,
                      diagnose: data.reprcdImpression,
                      hp: data.hp
                  };
                }

                resolve(result);
            }).catch(error => {
                OHIF.log.error('Get ai report failed: ', error);
                reject(error);
            })
        });
    }
}
