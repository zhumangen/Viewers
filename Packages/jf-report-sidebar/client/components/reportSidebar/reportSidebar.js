import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Tracker } from 'meteor/tracker';
import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { OHIF } from 'meteor/ohif:core';
import { JF } from 'meteor/jf:core';

Template.reportSidebar.onCreated(() => {
    const instance = Template.instance();
    instance.isHiReport = new ReactiveVar(false);
    instance.hiReport = new ReactiveDict();
    instance.aiReport = new ReactiveDict();

    instance.api = {
      getHiReport: () => {
        const api = instance.data.reportApi;
        const params = Session.get('queryParams');
        const element = OHIF.viewerbase.viewportUtils.getActiveViewportElement();
        const { getImageAttributes } = JF.measurements.MeasurementHandlers;
        const imageAttributes = getImageAttributes(element);
        const options = Object.assign({}, params, imageAttributes);
        instance.hiReport.set('loading', true);
        api.getHiReport(options).then(data => {
            instance.hiReport.set('data', data);
            instance.hiReport.set('loading', false);
            instance.hiReport.set('updateTime', new Date());
        }).catch(error => {
            instance.hiReport.set('data', {findings: '请求失败', diagnose: '请求失败'});
            instance.hiReport.set('loading', false);
            instance.hiReport.set('updateTime', new Date());
        });
      },
      getAiReport: () => {
        const api = instance.data.reportApi;
        const data = {};
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
        const options = { data };
        instance.aiReport.set('loading', true);
        api.getAiReport(options).then(data => {
            instance.aiReport.set('data', data);
            instance.aiReport.set('loading', false);
            instance.aiReport.set('updateTime', new Date());
        }).catch(error => {
            instance.aiReport.set('data', {findings: '请求失败', diagnose: '请求失败'});
            instance.aiReport.set('loading', false);
            instance.aiReport.set('updateTime', new Date());
        });
      }
    }
});

Template.reportSidebar.onRendered(() => {
    const instance = Template.instance();

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
    }
});

Template.reportSidebar.events({
    'click .report-header div'(event, instance){
      const $thisTarget = $(event.currentTarget);
      instance.isHiReport.set($thisTarget.index() == 0)
    },
    'click #update-btn'(event, instance) {
      instance.isHiReport.get()?instance.api.getHiReport():instance.api.getAiReport();
    }
});
