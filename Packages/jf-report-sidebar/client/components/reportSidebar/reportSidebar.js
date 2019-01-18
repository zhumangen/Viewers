import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Tracker } from 'meteor/tracker';
import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';
import { cornerstone } from 'meteor/ohif:cornerstone';

Template.reportSidebar.onCreated(() => {
    const instance = Template.instance();
    instance.isHiReport = new ReactiveVar(false);
    instance.hiReport = new ReactiveDict();
    instance.aiReport = new ReactiveDict();

    instance.api = {
      getHiReport: () => {
        const api = JF.managers.reports;
        const params = Session.get('queryParams');
        const element = JF.viewerbase.viewportUtils.getActiveViewportElement();
        if (!element) return;

        const enabledElement = cornerstone.getEnabledElement(element);
        if (!enabledElement || !enabledElement.image) return;

        const { getImageAttributes } = JF.measurements.MeasurementHandlers;
        const imageAttributes = getImageAttributes(element);
        if (!imageAttributes || !imageAttributes.studyInstanceUid) return;

        clearInterval(instance.timerId);
        const options = Object.assign({}, params, imageAttributes);
        instance.hiReport.set('loading', true);
        api.getHiReport(options).then(data => {
            if (!data.findings && !data.diagnose) data.invalid = true;
            instance.hiReport.set('data', data);
            instance.hiReport.set('loading', false);
            instance.hiReport.set('updateTime', new Date());
        }).catch(error => {
            instance.hiReport.set('data', {findings: '请求失败', diagnose: '请求失败', invalid: true});
            instance.hiReport.set('loading', false);
            instance.hiReport.set('updateTime', new Date());
        });
      },
      getAiReport: () => {
        const api = JF.managers.reports;
        let data = {};
        const config = JF.measurements.MeasurementApi.getConfiguration();
        const measurementApi = instance.data.measurementApi;
        config.measurementTools.forEach(toolGroup => {
          toolGroup.childTools.forEach(tool => {
            if (!data[toolGroup.id]) {
                data[toolGroup.id] = [];
            }
            data[toolGroup.id] = data[toolGroup.id].concat(measurementApi.tools[tool.id].find().fetch());
          });
        });

        let ww, wc;
        const meas = data[config.measurementTools[0].id];
        if (meas.length > 0) {
          ww = meas[0].viewport.voi.windowWidth;
          wc = meas[0].viewport.voi.windowCenter;
        }

        const classifier = {};
        Object.keys(data).forEach(groupId => {
          data[groupId].forEach(item => {
            const path = item.imagePath;
            if (!classifier[path]) {
              classifier[path] = {};
            }
            if (!classifier[path][groupId]) {
              classifier[path][groupId] = [];
            }
            classifier[path][groupId].push(item);
          });
        });

        data = [];
        Object.keys(classifier).forEach(path => {
            const groups = classifier[path];
            Object.keys(groups).forEach(groupId => {
              groups[groupId].sort((a, b) => {
                  if (a.measurementNumber > b.measurementNumber) {
                      return 1;
                  } else if (a.measurementNumber < b.measurementNumber) {
                      return -1;
                  }
                  return 0;
              });
            });

            const uids = path.split('_', 3);
            if (uids.length < 3) {
              OHIF.log.error('Image path format error: ', path);
            }
            const server = OHIF.servers.getCurrentServer();
            const url = server.wadoUriRoot + '?requestType=WADO&studyUID=';
            url += uids[0] + '&seriesUID=';
            url += uids[1] + '&objectUID=';
            url += uids[2];
            if (ww && wc) {
              url += '&windowWidth=' + ww;
              url += '&windowCenter=' + wc
            }
            data.push(Object.assign({url}, groups));
        });

        const options = { data };
        instance.aiReport.set('loading', true);
        api.getAiReport(options).then(data => {
            instance.aiReport.set('data', data);
            instance.aiReport.set('loading', false);
            instance.aiReport.set('updateTime', new Date());
        }).catch(error => {
            instance.aiReport.set('data', {findings: '请求失败', diagnose: '请求失败', invalid: true});
            instance.aiReport.set('loading', false);
            instance.aiReport.set('updateTime', new Date());
        });
      }
    }
});

Template.reportSidebar.onRendered(() => {
    const instance = Template.instance();
    instance.timerId = setInterval(instance.api.getHiReport, 1000);
    instance.getAiReportWrapper = _.throttle(instance.api.getAiReport, 1000);

    instance.autorun(() => {
      const measurementApi = instance.data.measurementApi;
      measurementApi.changeObserver.depend();
      instance.getAiReportWrapper();
    });
});

Template.reportSidebar.helpers({
    updateTime() {
      const instance = Template.instance();
      return instance.isHiReport.get()?instance.hiReport.get('updateTime'):instance.aiReport.get('updateTime');
    },
    isLoading() {
      const instance = Template.instance();
      return instance.isHiReport.get()?instance.hiReport.get('loading'):instance.aiReport.get('loading');
    },
    hiSelected() {
      return Template.instance().isHiReport.get();
    },
    reportContent() {
      const instance = Template.instance();
      return instance.isHiReport.get()?instance.hiReport.get('data'):instance.aiReport.get('data');
    },
    hasHiReport() {
      const instance = Template.instance();
      const data = instance.hiReport.get('data');
      return data && !data.invalid;
    }
});

Template.reportSidebar.events({
    'click .report-header div'(event, instance){
      const length = $('.report-header>div').length;
      if(length > 1) {
        const $thisTarget = $(event.currentTarget);
        instance.isHiReport.set($thisTarget.index() == 0)
      }
    }
});
